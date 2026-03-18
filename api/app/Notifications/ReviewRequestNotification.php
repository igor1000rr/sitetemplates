<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class ReviewRequestNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $templateTitle,
        public string $templateSlug,
    ) {}

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Как вам шаблон? Оставьте отзыв')
            ->view('emails.review-request', [
                'name' => $notifiable->name,
                'templateTitle' => $this->templateTitle,
                'templateSlug' => $this->templateSlug,
            ]);
    }
}
