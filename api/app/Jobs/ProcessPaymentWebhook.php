<?php

namespace App\Jobs;

use App\Models\Order;
use App\Models\Download;
use App\Models\AuthorEarning;
use App\Notifications\OrderPaidNotification;
use App\Services\TelegramService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessPaymentWebhook implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 30;

    public function __construct(
        public array $data
    ) {}

    public function handle(TelegramService $telegram): void
    {
        $object = $this->data['object'] ?? [];
        $paymentId = $object['id'] ?? null;
        $status = $object['status'] ?? null;

        if (!$paymentId || !$status) {
            Log::warning('ProcessPaymentWebhook: missing payment_id or status', $this->data);
            return;
        }

        // Проверяем — это подписка или заказ?
        $metadata = $object['metadata'] ?? [];
        $type = $metadata['type'] ?? 'order';

        if (in_array($type, ['subscription', 'subscription_renewal'])) {
            if ($status === 'succeeded') {
                try {
                    app(\App\Services\SubscriptionService::class)->handlePaymentSuccess($object);
                } catch (\Throwable $e) {
                    Log::error("Subscription webhook error: {$e->getMessage()}");
                }
            }
            return;
        }

        // Обычный заказ
        $order = Order::where('payment_id', $paymentId)
            ->with(['user', 'items.template'])
            ->first();

        if (!$order) {
            Log::error("ProcessPaymentWebhook: order not found for payment {$paymentId}");
            return;
        }

        match ($status) {
            'succeeded' => $this->handleSuccess($order, $telegram),
            'canceled' => $this->handleCanceled($order),
            'refunded' => $this->handleRefund($order),
            default => Log::info("ProcessPaymentWebhook: unhandled status {$status}"),
        };
    }

    private function handleSuccess(Order $order, TelegramService $telegram): void
    {
        // Идемпотентность — не обрабатываем повторно
        if ($order->status === 'paid') {
            Log::info("ProcessPaymentWebhook: order {$order->order_number} already paid, skipping");
            return;
        }

        $order->update([
            'status' => 'paid',
            'paid_at' => now(),
            'payment_method' => $this->data['object']['payment_method']['type'] ?? null,
        ]);

        // Инкремент продаж + начисление авторам
        foreach ($order->items as $item) {
            if ($item->template) {
                $item->template->increment('sales_count');

                // Начисление автору (если шаблон от автора, а не от платформы)
                $authorId = $item->template->author_id;
                if ($authorId) {
                    $profile = \App\Models\AuthorProfile::where('user_id', $authorId)->first();
                    if ($profile) {
                        $authorAmount = $profile->creditEarning($item->price);
                        AuthorEarning::create([
                            'author_id' => $authorId,
                            'order_id' => $order->id,
                            'order_item_id' => $item->id,
                            'template_id' => $item->template_id,
                            'sale_amount' => $item->price,
                            'commission_percent' => $profile->commission,
                            'author_amount' => $authorAmount,
                            'platform_amount' => $item->price - $authorAmount,
                        ]);
                    }
                }
            }
        }

        // Email покупателю
        try {
            $order->user->notify(new OrderPaidNotification($order));
        } catch (\Throwable $e) {
            Log::error("Failed to send OrderPaid email: {$e->getMessage()}");
        }

        // In-app уведомление
        try {
            \App\Models\Notification::push(
                $order->user_id,
                'order_paid',
                'Заказ оплачен',
                "Заказ {$order->order_number} оплачен. Шаблоны доступны для скачивания.",
                '/account'
            );
        } catch (\Throwable $e) {
            Log::error("Failed to push notification: {$e->getMessage()}");
        }

        // Abandoned cart → recovered
        \App\Models\AbandonedCart::where('user_id', $order->user_id)
            ->where('recovered', false)
            ->update(['recovered' => true]);

        // Реферальная комиссия
        try {
            app(\App\Services\ReferralService::class)->rewardForOrder($order);
        } catch (\Throwable $e) {
            Log::error("Referral reward failed: {$e->getMessage()}");
        }

        // Telegram админу
        try {
            $telegram->notifyOrderPaid($order);
        } catch (\Throwable $e) {
            Log::error("Failed to send Telegram notification: {$e->getMessage()}");
        }

        Log::info("Order paid: {$order->order_number}, total: {$order->total}");
    }

    private function handleCanceled(Order $order): void
    {
        if ($order->status === 'cancelled') return;

        $order->update(['status' => 'cancelled']);
        Log::info("Order cancelled: {$order->order_number}");
    }

    private function handleRefund(Order $order): void
    {
        if ($order->status === 'refunded') return;

        $order->update(['status' => 'refunded']);

        // Декремент продаж
        foreach ($order->items as $item) {
            if ($item->template) {
                $item->template->decrement('sales_count');
            }
        }

        // Отменить заработки авторов
        $earnings = AuthorEarning::where('order_id', $order->id)->get();
        foreach ($earnings as $earning) {
            $profile = \App\Models\AuthorProfile::where('user_id', $earning->author_id)->first();
            if ($profile) {
                $profile->decrement('balance', $earning->author_amount);
                $profile->decrement('total_earned', $earning->author_amount);
                $profile->decrement('total_sales');
            }
            $earning->delete();
        }

        // Удалить доступ к скачиванию
        Download::where('order_id', $order->id)->delete();

        Log::info("Order refunded: {$order->order_number}");
    }
}
