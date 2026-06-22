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

// ─── Диагностика S3 (временная) ───
Artisan::command('diag:s3', function () {
    $c = config('filesystems.disks.s3');
    $this->line('driver='.($c['driver'] ?? '?'));
    $this->line('region='.($c['region'] ?? ''));
    $this->line('bucket='.($c['bucket'] ?? ''));
    $this->line('endpoint='.($c['endpoint'] ?? ''));
    $this->line('use_path_style='.var_export($c['use_path_style_endpoint'] ?? null, true));
    $this->line('key='.(!empty($c['key']) ? 'SET ('.strlen($c['key']).' chars)' : 'EMPTY'));
    $this->line('secret='.(!empty($c['secret']) ? 'SET' : 'EMPTY'));
    try {
        $exists = \Illuminate\Support\Facades\Storage::disk('s3')->exists('health_check');
        $this->info('S3_CHECK=OK (exists='.var_export($exists, true).')');
    } catch (\Throwable $e) {
        $this->error('S3_CHECK_ERROR='.get_class($e).' :: '.substr($e->getMessage(), 0, 500));
    }
})->purpose('Диагностика подключения к S3 без вывода секретов');
