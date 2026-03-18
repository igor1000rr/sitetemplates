<?php

namespace App\Notifications;

use App\Models\Subscription;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class SubscriptionExpiringNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Subscription $subscription,
    ) {}

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $daysLeft = $this->subscription->days_left;
        $daysWord = $this->pluralDays($daysLeft);

        return (new MailMessage)
            ->subject("Подписка заканчивается через {$daysLeft} дн.")
            ->view('emails.subscription-expiring', [
                'name' => $notifiable->name,
                'planName' => $this->subscription->plan->name,
                'daysLeft' => $daysLeft,
                'daysWord' => $daysWord,
                'isCancelled' => $this->subscription->isCancelled(),
            ]);
    }

    private function pluralDays(int $n): string
    {
        $abs = abs($n) % 100;
        $n1 = $abs % 10;
        if ($abs > 10 && $abs < 20) return 'дней';
        if ($n1 > 1 && $n1 < 5) return 'дня';
        if ($n1 === 1) return 'день';
        return 'дней';
    }
}
