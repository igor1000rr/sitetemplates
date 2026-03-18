<?php

namespace App\Jobs;

use App\Models\AbandonedCart;
use App\Notifications\AbandonedCartNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendAbandonedCartReminders implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Найти корзины старше 1 часа без отправленных напоминаний.
     * Запускать hourly через Schedule.
     */
    public function handle(): void
    {
        $carts = AbandonedCart::notReminded()
            ->where('created_at', '<', now()->subHour())
            ->where('created_at', '>', now()->subDays(3)) // Не старше 3 дней
            ->with('user')
            ->get();

        Log::info("SendAbandonedCartReminders: found {$carts->count()} carts");

        foreach ($carts as $cart) {
            if (!$cart->user) continue;

            try {
                $cart->user->notify(new AbandonedCartNotification($cart));

                $cart->update([
                    'reminder_sent' => true,
                    'reminded_at' => now(),
                ]);
            } catch (\Throwable $e) {
                Log::error("Failed to send abandoned cart #{$cart->id}: {$e->getMessage()}");
            }
        }
    }
}
