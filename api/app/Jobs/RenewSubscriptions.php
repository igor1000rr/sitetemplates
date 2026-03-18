<?php

namespace App\Jobs;

use App\Models\Subscription;
use App\Services\SubscriptionService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class RenewSubscriptions implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Находим подписки, истекающие сегодня, и продлеваем их
     * Запускать ежедневно через Schedule: php artisan schedule:run
     */
    public function handle(SubscriptionService $service): void
    {
        $expiring = Subscription::where('status', 'active')
            ->where('current_period_end', '<=', now())
            ->with('plan')
            ->get();

        Log::info("RenewSubscriptions: found {$expiring->count()} expiring subscriptions");

        foreach ($expiring as $sub) {
            try {
                $service->renewSubscription($sub);
            } catch (\Throwable $e) {
                Log::error("Failed to renew subscription #{$sub->id}: {$e->getMessage()}");
            }
        }
    }
}
