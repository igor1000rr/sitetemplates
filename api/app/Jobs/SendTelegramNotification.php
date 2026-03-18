<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendTelegramNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 10;

    public function __construct(
        public string $message,
        public ?string $chatId = null
    ) {}

    public function handle(): void
    {
        $token = config('services.telegram.bot_token');
        $chatId = $this->chatId ?? config('services.telegram.admin_chat_id');

        if (!$token || !$chatId) {
            Log::warning('Telegram not configured, skipping notification');
            return;
        }

        $response = Http::post("https://api.telegram.org/bot{$token}/sendMessage", [
            'chat_id' => $chatId,
            'text' => $this->message,
            'parse_mode' => 'HTML',
            'disable_web_page_preview' => true,
        ]);

        if (!$response->successful()) {
            Log::error('Telegram send failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            $this->fail();
        }
    }
}
