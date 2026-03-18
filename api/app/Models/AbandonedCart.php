<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AbandonedCart extends Model
{
    protected $fillable = [
        'user_id', 'items', 'total', 'reminder_sent', 'recovered', 'reminded_at',
    ];

    protected $casts = [
        'items' => 'array',
        'reminder_sent' => 'boolean',
        'recovered' => 'boolean',
        'reminded_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function scopeNotReminded($q)
    {
        return $q->where('reminder_sent', false)->where('recovered', false);
    }
}
