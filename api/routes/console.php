<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

// ─── Email-цепочки ───

// Abandoned cart — каждый час проверяем корзины старше 1ч
Schedule::job(new \App\Jobs\SendAbandonedCartReminders)->hourly();

// Review request — ежедневно ищем заказы 3-дневной давности
Schedule::job(new \App\Jobs\SendReviewRequests)->dailyAt('10:00');

// Subscription expiring — ежедневно проверяем подписки, истекающие через 3 дня
Schedule::job(new \App\Jobs\SendSubscriptionExpiringReminders)->dailyAt('09:00');

// ─── Автопродление подписок ───

Schedule::job(new \App\Jobs\RenewSubscriptions)->dailyAt('06:00');
