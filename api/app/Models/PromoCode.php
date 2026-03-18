<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PromoCode extends Model
{
    protected $fillable = [
        'code', 'discount_type', 'discount_value',
        'min_order', 'max_uses', 'used_count',
        'is_active', 'expires_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'expires_at' => 'datetime',
    ];

    public function isValid(int $orderTotal = 0): bool
    {
        if (!$this->is_active) return false;
        if ($this->expires_at && $this->expires_at->isPast()) return false;
        if ($this->max_uses && $this->used_count >= $this->max_uses) return false;
        if ($this->min_order && $orderTotal < $this->min_order) return false;
        return true;
    }

    public function calculateDiscount(int $subtotal): int
    {
        if ($this->discount_type === 'percent') {
            return (int) round($subtotal * $this->discount_value / 100);
        }
        return min($this->discount_value, $subtotal);
    }
}
