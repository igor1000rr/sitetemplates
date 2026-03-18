<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    protected $fillable = [
        'user_id', 'plan_id', 'billing_cycle', 'status',
        'yukassa_subscription_id', 'yukassa_payment_method_id',
        'price_paid', 'downloads_used',
        'current_period_start', 'current_period_end',
        'cancelled_at', 'trial_ends_at',
    ];

    protected $casts = [
        'current_period_start' => 'datetime',
        'current_period_end' => 'datetime',
        'cancelled_at' => 'datetime',
        'trial_ends_at' => 'datetime',
    ];

    // ─── Relationships ───

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function plan()
    {
        return $this->belongsTo(SubscriptionPlan::class, 'plan_id');
    }

    // ─── Scopes ───

    public function scopeActive($q)
    {
        return $q->where('status', 'active')
            ->where('current_period_end', '>', now());
    }

    // ─── Status checks ───

    public function isActive(): bool
    {
        return $this->status === 'active'
            && $this->current_period_end
            && $this->current_period_end->isFuture();
    }

    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    public function isExpired(): bool
    {
        return $this->current_period_end && $this->current_period_end->isPast();
    }

    /**
     * Есть ли у подписки лимит скачиваний и не превышен ли он
     */
    public function canDownload(): bool
    {
        if (!$this->isActive()) return false;

        $limit = $this->plan?->downloads_per_month ?? -1;
        if ($limit === -1) return true; // unlimited

        return $this->downloads_used < $limit;
    }

    public function recordDownload(): void
    {
        $this->increment('downloads_used');
    }

    /**
     * Продлить на следующий период
     */
    public function renew(): void
    {
        $start = now();
        $end = $this->billing_cycle === 'annual'
            ? $start->copy()->addYear()
            : $start->copy()->addMonth();

        $this->update([
            'status' => 'active',
            'current_period_start' => $start,
            'current_period_end' => $end,
            'downloads_used' => 0,
        ]);
    }

    /**
     * Отменить (доступ до конца оплаченного периода)
     */
    public function cancel(): void
    {
        $this->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
        ]);
    }

    // ─── Accessors ───

    public function getDaysLeftAttribute(): int
    {
        if (!$this->current_period_end) return 0;
        return max(0, (int) now()->diffInDays($this->current_period_end, false));
    }

    public function getPricePaidRubAttribute(): float
    {
        return $this->price_paid / 100;
    }
}
