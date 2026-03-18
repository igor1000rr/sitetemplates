<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReferralReward extends Model
{
    protected $fillable = [
        'referrer_id', 'referred_id', 'order_id', 'type', 'amount', 'description',
    ];

    public function referrer()
    {
        return $this->belongsTo(User::class, 'referrer_id');
    }

    public function referred()
    {
        return $this->belongsTo(User::class, 'referred_id');
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function getAmountRubAttribute(): float
    {
        return $this->amount / 100;
    }
}
