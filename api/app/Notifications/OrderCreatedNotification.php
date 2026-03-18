<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderCreatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Order $order
    ) {}

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $items = $this->order->items->map(fn ($i) => "• " . ($i->template?->title ?? 'Шаблон'))->implode("\n");
        $total = number_format($this->order->total / 100, 0, '.', ' ');

        return (new MailMessage)
            ->subject("Заказ {$this->order->order_number} создан")
            ->greeting("Здравствуйте, {$notifiable->name}!")
            ->line("Ваш заказ **{$this->order->order_number}** создан.")
            ->line("**Шаблоны:**\n{$items}")
            ->line("**Сумма:** {$total} ₽")
            ->line("Ожидаем оплату. После оплаты шаблоны будут доступны для скачивания в личном кабинете.")
            ->action('Личный кабинет', config('app.frontend_url') . '/account');
    }
}
