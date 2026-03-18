<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'order_number', 'user_id', 'subtotal', 'discount', 'total',
        'promo_code_id', 'status', 'payment_id', 'payment_method',
        'paid_at', 'ip', 'user_agent',
    ];

    protected $casts = [
        'paid_at' => 'datetime',
        'subtotal' => 'integer',
        'discount' => 'integer',
        'total' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function promoCode()
    {
        return $this->belongsTo(PromoCode::class);
    }

    public function downloads()
    {
        return $this->hasMany(Download::class);
    }

    public function isPaid(): bool
    {
        return $this->status === 'paid';
    }

    public function getTotalRubAttribute(): float
    {
        return $this->total / 100;
    }

    public static function generateNumber(): string
    {
        $date = now()->format('Ymd');
        $last = static::where('order_number', 'like', "TN-{$date}-%")->count();
        return sprintf('TN-%s-%04d', $date, $last + 1);
    }
}
