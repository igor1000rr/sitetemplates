<?php

namespace App\Notifications;

use App\Models\Subscription;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class SubscriptionActivatedNotification extends Notification implements ShouldQueue
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
        return (new MailMessage)
            ->subject('Подписка активирована!')
            ->view('emails.subscription-activated', [
                'name' => $notifiable->name,
                'planName' => $this->subscription->plan->name,
                'cycle' => $this->subscription->billing_cycle,
                'pricePaid' => $this->subscription->price_paid,
                'periodEnd' => $this->subscription->current_period_end?->format('d.m.Y'),
            ]);
    }
}
