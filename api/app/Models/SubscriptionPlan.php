<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubscriptionPlan extends Model
{
    protected $fillable = [
        'name', 'slug', 'description', 'price', 'annual_price',
        'downloads_per_month', 'features', 'is_popular', 'is_active', 'sort_order',
    ];

    protected $casts = [
        'features' => 'array',
        'is_popular' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class, 'plan_id');
    }

    public function scopeActive($q)
    {
        return $q->where('is_active', true);
    }

    // ─── Accessors ───

    public function getPriceRubAttribute(): float
    {
        return $this->price / 100;
    }

    public function getAnnualPriceRubAttribute(): ?float
    {
        return $this->annual_price ? $this->annual_price / 100 : null;
    }

    public function getMonthlyFromAnnualAttribute(): ?float
    {
        return $this->annual_price ? round($this->annual_price / 12 / 100) : null;
    }
}
