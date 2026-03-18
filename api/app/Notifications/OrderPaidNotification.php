<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderPaidNotification extends Notification implements ShouldQueue
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
        $items = $this->order->items->map(fn ($i) => [
            'title' => $i->template?->title ?? 'Шаблон',
            'price' => $i->price,
        ])->toArray();

        return (new MailMessage)
            ->subject("Заказ {$this->order->order_number} оплачен")
            ->view('emails.order-paid', [
                'name' => $notifiable->name,
                'orderNumber' => $this->order->order_number,
                'items' => $items,
                'total' => $this->order->total,
            ]);
    }
}
