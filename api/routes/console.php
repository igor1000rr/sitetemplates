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

// ─── Диагностика готовности к запуску (временная, без вывода секретов) ───
Artisan::command('diag:launch', function () {
    $mask = fn ($v) => !empty($v) ? 'SET' : 'EMPTY';

    $this->line('── S3 ──');
    $s3 = config('filesystems.disks.s3');
    $this->line('region='.($s3['region'] ?? ''));
    $this->line('bucket='.($s3['bucket'] ?? ''));
    $this->line('endpoint='.($s3['endpoint'] ?? ''));
    $this->line('use_path_style='.var_export($s3['use_path_style_endpoint'] ?? null, true));
    $this->line('key='.$mask($s3['key'] ?? null).' secret='.$mask($s3['secret'] ?? null));
    try {
        \Illuminate\Support\Facades\Storage::disk('s3')->exists('health_check');
        $this->info('S3_CHECK=OK');
    } catch (\Throwable $e) {
        $this->error('S3_CHECK_ERROR='.class_basename($e).' :: '.substr($e->getMessage(), 0, 200));
    }

    $this->line('── Интеграции (SET/EMPTY) ──');
    $this->line('yookassa: shop_id='.$mask(config('services.yookassa.shop_id')).' secret='.$mask(config('services.yookassa.secret_key')));
    $this->line('telegram: bot_token='.$mask(config('services.telegram.bot_token')).' admin_chat_id='.$mask(config('services.telegram.admin_chat_id')));
    $this->line('mail: host='.config('mail.mailers.smtp.host').' password='.$mask(config('mail.mailers.smtp.password')));
    $this->line('openai: api_key='.$mask(config('services.openai.api_key')));
    $this->line('google: client_id='.$mask(config('services.google.client_id')).' secret='.$mask(config('services.google.client_secret')));
    $this->line('yandex: client_id='.$mask(config('services.yandex.client_id')).' secret='.$mask(config('services.yandex.client_secret')));
})->purpose('Диагностика готовности к запуску (S3 + интеграции, без секретов)');
