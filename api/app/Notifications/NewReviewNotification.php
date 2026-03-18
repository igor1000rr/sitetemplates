<?php

namespace App\Notifications;

use App\Models\Review;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewReviewNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Review $review
    ) {}

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Новый отзыв на «{$this->review->template->title}»")
            ->greeting('Новый отзыв ожидает модерации')
            ->line("**Шаблон:** {$this->review->template->title}")
            ->line("**Автор:** {$this->review->user->name}")
            ->line("**Оценка:** " . str_repeat('⭐', $this->review->rating))
            ->line("**Текст:** {$this->review->text}")
            ->action('Модерировать', config('app.frontend_url') . '/admin/reviews');
    }
}
