<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramService
{
    private string $token;
    private string $chatId;

    public function __construct()
    {
        $this->token = config('services.telegram.bot_token', '');
        $this->chatId = config('services.telegram.admin_chat_id', '');
    }

    public function isEnabled(): bool
    {
        return !empty($this->token) && !empty($this->chatId);
    }

    public function send(string $message): bool
    {
        if (!$this->isEnabled()) return false;

        try {
            $response = Http::post("https://api.telegram.org/bot{$this->token}/sendMessage", [
                'chat_id' => $this->chatId,
                'text' => $message,
                'parse_mode' => 'HTML',
                'disable_web_page_preview' => true,
            ]);

            return $response->successful();
        } catch (\Throwable $e) {
            Log::error('Telegram notification failed: ' . $e->getMessage());
            return false;
        }
    }

    public function notifyNewOrder(\App\Models\Order $order): bool
    {
        $items = $order->items->map(fn ($i) => $i->template?->title)->filter()->implode("\n• ");
        $total = number_format($order->total / 100, 0, '.', ' ');

        return $this->send(
            "🛒 <b>Новый заказ!</b>\n\n" .
            "📋 {$order->order_number}\n" .
            "👤 {$order->user->name} ({$order->user->email})\n" .
            "📦 Шаблоны:\n• {$items}\n" .
            "💰 <b>{$total} ₽</b>\n\n" .
            "⏳ Ожидает оплаты"
        );
    }

    public function notifyOrderPaid(\App\Models\Order $order): bool
    {
        $total = number_format($order->total / 100, 0, '.', ' ');

        return $this->send(
            "✅ <b>Заказ оплачен!</b>\n\n" .
            "📋 {$order->order_number}\n" .
            "👤 {$order->user->name}\n" .
            "💰 <b>{$total} ₽</b>\n" .
            "💳 {$order->payment_method}"
        );
    }

    public function notifyNewReview(\App\Models\Review $review): bool
    {
        $stars = str_repeat('⭐', $review->rating);

        return $this->send(
            "💬 <b>Новый отзыв!</b>\n\n" .
            "📦 {$review->template->title}\n" .
            "👤 {$review->user->name}\n" .
            "{$stars}\n" .
            "\"{$review->text}\"\n\n" .
            "⏳ Ожидает модерации"
        );
    }
}
