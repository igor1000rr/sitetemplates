<?php

namespace App\Services;

use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Notifications\SubscriptionActivatedNotification;
use YooKassa\Client;
use Illuminate\Support\Facades\DB;
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

        // Подписка создаётся в статусе pending и НЕ даёт доступа, пока оплата
        // не подтверждена вебхуком. Период начинается с момента оплаты.
        $subscription = Subscription::create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'billing_cycle' => $cycle,
            'status' => 'pending',
            'price_paid' => $price,
            'current_period_start' => null,
            'current_period_end' => null,
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
     * Обработка успешного платежа подписки (из webhook).
     * $payment — нормализованные ДОВЕРЕННЫЕ данные из API ЮKassa
     * (status / amount / metadata / payment_method).
     */
    public function handlePaymentSuccess(array $payment): void
    {
        $metadata = $payment['metadata'] ?? [];
        $type = $metadata['type'] ?? '';

        if (!in_array($type, ['subscription', 'subscription_renewal'])) {
            return; // Это не подписка
        }

        $subscriptionId = $metadata['subscription_id'] ?? null;
        if (!$subscriptionId) return;

        $subscription = Subscription::with('plan')->find($subscriptionId);
        if (!$subscription) {
            Log::error("Subscription not found: {$subscriptionId}");
            return;
        }

        // Сверяем оплаченную сумму с ценой плана за выбранный цикл
        $expectedPrice = $subscription->billing_cycle === 'annual'
            ? $subscription->plan?->annual_price
            : $subscription->plan?->price;

        if (!$this->amountMatches($payment, (int) $expectedPrice)) {
            Log::error("Subscription #{$subscription->id}: amount mismatch", [
                'expected' => $expectedPrice,
                'paid' => $payment['amount']['value'] ?? null,
            ]);
            return;
        }

        $paymentMethodId = $payment['payment_method_id'] ?? null;

        if ($type === 'subscription_renewal') {
            $this->extendRenewal($subscription);
            return;
        }

        // Первичная активация — идемпотентно (только из не-active состояния)
        $activated = DB::transaction(function () use ($subscription, $paymentMethodId) {
            $locked = Subscription::whereKey($subscription->id)->lockForUpdate()->first();
            if (!$locked || $locked->status === 'active') {
                return false;
            }

            $start = now();
            $end = $locked->billing_cycle === 'annual' ? $start->copy()->addYear() : $start->copy()->addMonth();

            $locked->update([
                'status' => 'active',
                'current_period_start' => $start,
                'current_period_end' => $end,
                'downloads_used' => 0,
                'yukassa_payment_method_id' => $paymentMethodId ?: $locked->yukassa_payment_method_id,
            ]);

            return true;
        });

        if ($activated) {
            $subscription->refresh()->load('plan');
            try {
                $subscription->user->notify(new SubscriptionActivatedNotification($subscription));
            } catch (\Throwable $e) {
                Log::error("Subscription activation email failed: {$e->getMessage()}");
            }
            Log::info("Subscription activated: #{$subscription->id} for user #{$subscription->user_id}");
        }
    }

    /**
     * Автопродление подписки (вызывается из scheduled job).
     * Период НЕ продлевается оптимистично — только после подтверждённой оплаты
     * (синхронно, если ЮKassa сразу вернула succeeded, и/или через webhook).
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

        // Детерминированный ключ идемпотентности привязан к периоду —
        // повторный/параллельный вызов будет дедуплицирован самой ЮKassa.
        $periodKey = optional($subscription->current_period_end)->timestamp ?? $subscription->id;
        $idempotenceKey = "renew_{$subscription->id}_{$periodKey}";

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
            ], $idempotenceKey);

            // Продлеваем только если оплата уже подтверждена; иначе ждём webhook.
            if ((string) $payment->getStatus() === 'succeeded') {
                $subscription->update(['price_paid' => $price]);
                $this->extendRenewal($subscription);
            }

            Log::info("Subscription renewal initiated: #{$subscription->id}");
            return true;

        } catch (\Throwable $e) {
            Log::error("Subscription renewal failed: #{$subscription->id} — {$e->getMessage()}");
            $subscription->update(['status' => 'past_due']);
            return false;
        }
    }

    /**
     * Продлить период подписки после подтверждённой оплаты — идемпотентно.
     */
    private function extendRenewal(Subscription $subscription): void
    {
        DB::transaction(function () use ($subscription) {
            $locked = Subscription::whereKey($subscription->id)->lockForUpdate()->first();
            if (!$locked || $locked->isCancelled()) {
                return;
            }

            // Уже продлено (период далеко в будущем) — повторный webhook игнорируем.
            if ($locked->current_period_end && $locked->current_period_end->isFuture()
                && $locked->current_period_end->gt(now()->addDays(2))) {
                return;
            }

            $locked->renew();
        });
    }

    /**
     * Отмена подписки (доступ до конца периода)
     */
    public function cancelSubscription(Subscription $subscription): void
    {
        $subscription->cancel();
        Log::info("Subscription cancelled: #{$subscription->id}, active until {$subscription->current_period_end}");
    }

    private function amountMatches(array $payment, int $expectedKopecks): bool
    {
        if ($expectedKopecks <= 0) {
            return false;
        }

        $paid = $payment['amount']['value'] ?? null;
        if ($paid === null) {
            return true; // dev fallback — сумма из API недоступна
        }

        $currency = $payment['amount']['currency'] ?? null;
        $expected = number_format($expectedKopecks / 100, 2, '.', '');

        return number_format((float) $paid, 2, '.', '') === $expected
            && ($currency === null || $currency === 'RUB');
    }
}
