<?php

namespace App\Jobs;

use App\Models\Subscription;
use App\Notifications\SubscriptionExpiringNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendSubscriptionExpiringReminders implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Найти подписки, истекающие через 3 дня.
     * Запускать daily через Schedule.
     */
    public function handle(): void
    {
        $subscriptions = Subscription::whereIn('status', ['active', 'cancelled'])
            ->whereBetween('current_period_end', [
                now()->addDays(2)->startOfDay(),
                now()->addDays(3)->endOfDay(),
            ])
            ->with(['user', 'plan'])
            ->get();

        Log::info("SendSubscriptionExpiringReminders: found {$subscriptions->count()}");

        foreach ($subscriptions as $sub) {
            if (!$sub->user) continue;

            try {
                $sub->user->notify(new SubscriptionExpiringNotification($sub));
                Log::info("Expiring reminder sent: subscription #{$sub->id}");
            } catch (\Throwable $e) {
                Log::error("Failed expiring reminder #{$sub->id}: {$e->getMessage()}");
            }
        }
    }
}
