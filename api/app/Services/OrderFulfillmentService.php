<?php

namespace App\Services;

use App\Models\AuthorEarning;
use App\Models\AuthorProfile;
use App\Models\Order;
use App\Notifications\OrderPaidNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Единая точка фулфилмента заказа — используется и вебхуком оплаты,
 * и путём бесплатного (0₽) заказа. Перевод заказа в оплаченный статус
 * выполняется под блокировкой строки и идемпотентно, чтобы повторные
 * (ретраи ЮKassa) или параллельные вызовы не начисляли авторам/рефералам дважды.
 */
class OrderFulfillmentService
{
    /**
     * Отметить заказ оплаченным и выполнить все начисления + уведомления.
     * Возвращает true только если заказ реально перешёл в paid в этом вызове.
     */
    public function completeOrder(Order $order, ?string $paymentMethod = null): bool
    {
        $transitioned = DB::transaction(function () use ($order, $paymentMethod) {
            // Блокируем строку заказа — защита от параллельных вебхуков (double-fulfill)
            $locked = Order::whereKey($order->id)->lockForUpdate()->first();
            if (!$locked) {
                return false;
            }

            // Идемпотентность — повторно не обрабатываем
            if ($locked->status === 'paid') {
                return false;
            }

            $locked->update([
                'status' => 'paid',
                'paid_at' => now(),
                'payment_method' => $paymentMethod,
            ]);

            // Инкремент продаж + начисление авторам (идемпотентно по order_item_id)
            foreach ($locked->items()->with('template')->get() as $item) {
                if (!$item->template) {
                    continue;
                }

                $item->template->increment('sales_count');

                $authorId = $item->template->author_id;
                if (!$authorId) {
                    continue;
                }

                if (AuthorEarning::where('order_item_id', $item->id)->exists()) {
                    continue;
                }

                $profile = AuthorProfile::where('user_id', $authorId)->first();
                if (!$profile) {
                    continue;
                }

                $authorAmount = $profile->creditEarning($item->price);
                AuthorEarning::create([
                    'author_id' => $authorId,
                    'order_id' => $locked->id,
                    'order_item_id' => $item->id,
                    'template_id' => $item->template_id,
                    'sale_amount' => $item->price,
                    'commission_percent' => $profile->commission,
                    'author_amount' => $authorAmount,
                    'platform_amount' => $item->price - $authorAmount,
                ]);
            }

            return true;
        });

        if (!$transitioned) {
            return false;
        }

        // ─── Побочные эффекты выполняем один раз, вне транзакции ───
        $order->refresh()->load(['user', 'items.template']);

        try {
            $order->user?->notify(new OrderPaidNotification($order));
        } catch (\Throwable $e) {
            Log::error("Failed to send OrderPaid email: {$e->getMessage()}");
        }

        try {
            \App\Models\Notification::pushNotification(
                $order->user_id,
                'order_paid',
                'Заказ оплачен',
                "Заказ {$order->order_number} оплачен. Шаблоны доступны для скачивания.",
                '/account'
            );
        } catch (\Throwable $e) {
            Log::error("Failed to push notification: {$e->getMessage()}");
        }

        \App\Models\AbandonedCart::where('user_id', $order->user_id)
            ->where('recovered', false)
            ->update(['recovered' => true]);

        try {
            app(ReferralService::class)->rewardForOrder($order);
        } catch (\Throwable $e) {
            Log::error("Referral reward failed: {$e->getMessage()}");
        }

        try {
            app(TelegramService::class)->notifyOrderPaid($order);
        } catch (\Throwable $e) {
            Log::error("Failed to send Telegram notification: {$e->getMessage()}");
        }

        Log::info("Order paid: {$order->order_number}, total: {$order->total}");

        return true;
    }
}
