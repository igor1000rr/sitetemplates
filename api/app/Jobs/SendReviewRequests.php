<?php

namespace App\Jobs;

use App\Models\Order;
use App\Models\Review;
use App\Notifications\ReviewRequestNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendReviewRequests implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Найти заказы оплаченные 3 дня назад, без отзывов.
     * Запускать daily через Schedule.
     */
    public function handle(): void
    {
        $orders = Order::where('status', 'paid')
            ->whereNull('review_request_sent_at') // не отправляем повторно
            ->whereBetween('paid_at', [
                now()->subDays(4)->startOfDay(),
                now()->subDays(3)->endOfDay(),
            ])
            ->with(['user', 'items.template'])
            ->get();

        Log::info("SendReviewRequests: checking {$orders->count()} orders");

        foreach ($orders as $order) {
            if (!$order->user) continue;

            foreach ($order->items as $item) {
                $template = $item->template;
                if (!$template) continue;

                // Проверяем: уже есть отзыв от этого пользователя?
                $hasReview = Review::where('user_id', $order->user_id)
                    ->where('template_id', $template->id)
                    ->exists();

                if ($hasReview) continue;

                try {
                    $order->user->notify(new ReviewRequestNotification(
                        $template->title,
                        $template->slug,
                    ));

                    // Помечаем заказ — больше письмо-просьбу по нему не шлём
                    Order::whereKey($order->id)->update(['review_request_sent_at' => now()]);

                    Log::info("Review request sent: user #{$order->user_id}, template #{$template->id}");
                    break; // Один email на заказ, не спамим
                } catch (\Throwable $e) {
                    Log::error("Failed review request: {$e->getMessage()}");
                }
            }
        }
    }
}
