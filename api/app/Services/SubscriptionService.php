<?php

namespace App\Services;

use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Notifications\SubscriptionActivatedNotification;
use YooKassa\Client;
use Illuminate\Support\Facades\Log;

class SubscriptionService
{
    private Client $client;

    public function __construct()
    {
        $this->client = new Client();
        $shopId = config('services.yookassa.shop_id');
        $secretKey = config('services.yookassa.secret_key');
        if ($shopId && $secretKey) {
            $this->client->setAuth((int) $shopId, $secretKey);
        }
    }

    /**
     * Создать подписку — первый платёж
     */
    public function createSubscription(User $user, SubscriptionPlan $plan, string $cycle = 'monthly'): array
    {
        // Проверяем нет ли уже активной подписки
        if ($user->hasActiveSubscription()) {
            throw new \Exception('У вас уже есть активная подписка');
        }

        $price = $cycle === 'annual' ? $plan->annual_price : $plan->price;

        if (!$price || $price <= 0) {
            throw new \Exception('Некорректная цена плана');
        }

        // Создаём подписку в статусе pending
        $subscription = Subscription::create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'billing_cycle' => $cycle,
            'status' => 'active', // станет active после оплаты
            'price_paid' => $price,
            'current_period_start' => now(),
            'current_period_end' => $cycle === 'annual'
                ? now()->addYear()
                : now()->addMonth(),
        ]);

        // Создаём платёж в ЮKassa с сохранением способа оплаты
        $payment = $this->client->createPayment([
            'amount' => [
                'value' => number_format($price / 100, 2, '.', ''),
                'currency' => 'RUB',
            ],
            'confirmation' => [
                'type' => 'redirect',
                'return_url' => config('app.frontend_url') . '/account/subscription?success=1',
            ],
            'capture' => true,
            'save_payment_method' => true, // Для автопродлений
            'description' => "Подписка {$plan->name} ({$cycle})",
            'metadata' => [
                'type' => 'subscription',
                'subscription_id' => $subscription->id,
                'plan_id' => $plan->id,
                'user_id' => $user->id,
            ],
        ], uniqid('sub_', true));

        $subscription->update([
            'yukassa_subscription_id' => $payment->getId(),
        ]);

        return [
            'subscription_id' => $subscription->id,
            'payment_id' => $payment->getId(),
            'confirmation_url' => $payment->getConfirmation()->getConfirmationUrl(),
        ];
    }

    /**
     * Обработка успешного платежа подписки (из webhook)
     */
    public function handlePaymentSuccess(array $paymentData): void
    {
        $metadata = $paymentData['metadata'] ?? [];

        if (($metadata['type'] ?? '') !== 'subscription') {
            return; // Это не подписка
        }

        $subscriptionId = $metadata['subscription_id'] ?? null;
        if (!$subscriptionId) return;

        $subscription = Subscription::find($subscriptionId);
        if (!$subscription) {
            Log::error("Subscription not found: {$subscriptionId}");
            return;
        }

        // Сохраняем способ оплаты для автопродлений
        $paymentMethodId = $paymentData['payment_method']['id'] ?? null;
        if ($paymentMethodId) {
            $subscription->update([
                'yukassa_payment_method_id' => $paymentMethodId,
                'status' => 'active',
            ]);
        }

        // Email — подписка активирована
        $subscription->load('plan');
        $subscription->user->notify(new SubscriptionActivatedNotification($subscription));

        Log::info("Subscription activated: #{$subscription->id} for user #{$subscription->user_id}");
    }

    /**
     * Автопродление подписки (вызывается из scheduled job)
     */
    public function renewSubscription(Subscription $subscription): bool
    {
        if (!$subscription->yukassa_payment_method_id) {
            Log::warning("No payment method for subscription #{$subscription->id}");
            $subscription->update(['status' => 'expired']);
            return false;
        }

        if ($subscription->isCancelled()) {
            $subscription->update(['status' => 'expired']);
            return false;
        }

        $plan = $subscription->plan;
        $price = $subscription->billing_cycle === 'annual'
            ? $plan->annual_price
            : $plan->price;

        try {
            $payment = $this->client->createPayment([
                'amount' => [
                    'value' => number_format($price / 100, 2, '.', ''),
                    'currency' => 'RUB',
                ],
                'capture' => true,
                'payment_method_id' => $subscription->yukassa_payment_method_id,
                'description' => "Продление подписки {$plan->name}",
                'metadata' => [
                    'type' => 'subscription_renewal',
                    'subscription_id' => $subscription->id,
                ],
            ], uniqid('renew_', true));

            // Продлеваем подписку
            $subscription->update([
                'price_paid' => $price,
            ]);
            $subscription->renew();

            Log::info("Subscription renewed: #{$subscription->id}");
            return true;

        } catch (\Throwable $e) {
            Log::error("Subscription renewal failed: #{$subscription->id} — {$e->getMessage()}");
            $subscription->update(['status' => 'past_due']);
            return false;
        }
    }

    /**
     * Отмена подписки (доступ до конца периода)
     */
    public function cancelSubscription(Subscription $subscription): void
    {
        $subscription->cancel();
        Log::info("Subscription cancelled: #{$subscription->id}, active until {$subscription->current_period_end}");
    }
}
