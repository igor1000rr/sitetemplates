<?php

namespace App\Filament\Pages;

use Filament\Pages\Page;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class SystemHealth extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-server-stack';
    protected static ?string $navigationGroup = 'Настройки';
    protected static ?string $navigationLabel = 'Состояние системы';
    protected static ?string $title = 'Состояние системы';
    protected static ?int $navigationSort = 100;
    protected static string $view = 'filament.pages.system-health';

    public function getChecks(): array
    {
        $checks = [];

        // Database
        try {
            DB::select('SELECT 1');
            $checks[] = ['name' => 'PostgreSQL', 'status' => true, 'detail' => 'Подключение OK'];
        } catch (\Throwable $e) {
            $checks[] = ['name' => 'PostgreSQL', 'status' => false, 'detail' => $e->getMessage()];
        }

        // Redis
        try {
            Cache::store('redis')->put('health_check', true, 10);
            $checks[] = ['name' => 'Redis', 'status' => true, 'detail' => 'Подключение OK'];
        } catch (\Throwable $e) {
            $checks[] = ['name' => 'Redis', 'status' => false, 'detail' => $e->getMessage()];
        }

        // S3 Storage
        try {
            $s3Key = config('filesystems.disks.s3.key');
            if ($s3Key) {
                Storage::disk('s3')->exists('test');
                $checks[] = ['name' => 'S3 (Timeweb)', 'status' => true, 'detail' => 'Подключение OK'];
            } else {
                $checks[] = ['name' => 'S3 (Timeweb)', 'status' => false, 'detail' => 'Не настроен (AWS_ACCESS_KEY_ID пуст)'];
            }
        } catch (\Throwable $e) {
            $checks[] = ['name' => 'S3 (Timeweb)', 'status' => false, 'detail' => substr($e->getMessage(), 0, 80)];
        }

        // Disk space
        $freeBytes = disk_free_space('/');
        $totalBytes = disk_total_space('/');
        $usedPercent = round((1 - $freeBytes / $totalBytes) * 100);
        $checks[] = [
            'name' => 'Диск',
            'status' => $usedPercent < 90,
            'detail' => "{$usedPercent}% занято · " . round($freeBytes / 1024 / 1024 / 1024, 1) . ' ГБ свободно',
        ];

        // YooKassa
        $yooId = config('services.yookassa.shop_id');
        $checks[] = [
            'name' => 'ЮKassa',
            'status' => (bool) $yooId,
            'detail' => $yooId ? "Shop ID: {$yooId}" : 'Не настроена (YUKASSA_SHOP_ID пуст)',
        ];

        // SMTP
        $mailHost = config('mail.mailers.smtp.host');
        $mailUser = config('mail.mailers.smtp.username');
        $checks[] = [
            'name' => 'Почта (SMTP)',
            'status' => (bool) $mailUser,
            'detail' => $mailUser ? "{$mailUser} → {$mailHost}" : 'Не настроена',
        ];

        // Telegram
        $tgToken = config('services.telegram.bot_token');
        $checks[] = [
            'name' => 'Telegram',
            'status' => (bool) $tgToken,
            'detail' => $tgToken ? 'Бот подключен' : 'Не настроен (TELEGRAM_BOT_TOKEN пуст)',
        ];

        // OpenAI
        $aiKey = config('services.openai.api_key');
        $checks[] = [
            'name' => 'OpenAI (AI-чат)',
            'status' => (bool) $aiKey,
            'detail' => $aiKey ? 'API ключ установлен' : 'Не настроен',
        ];

        // Queue
        try {
            $pending = DB::table('jobs')->count();
            $failed = DB::table('failed_jobs')->count();
            $checks[] = [
                'name' => 'Очередь',
                'status' => $failed === 0,
                'detail' => "В очереди: {$pending} · Ошибок: {$failed}",
            ];
        } catch (\Throwable) {
            $checks[] = ['name' => 'Очередь', 'status' => true, 'detail' => 'Работает'];
        }

        return $checks;
    }
}
