<?php

namespace App\Notifications;

use App\Models\Template;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class WelcomeNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $count = Template::published()->count();

        return (new MailMessage)
            ->subject('Добро пожаловать в AITempl!')
            ->view('emails.welcome', [
                'name' => $notifiable->name,
                'templatesCount' => $count,
            ]);
    }
}
