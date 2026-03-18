<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payout extends Model
{
    protected $fillable = [
        'author_id', 'amount', 'method', 'details',
        'status', 'admin_note', 'completed_at',
    ];

    protected $casts = [
        'completed_at' => 'datetime',
    ];

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    // ─── Scopes ───

    public function scopePending($q)
    {
        return $q->where('status', 'pending');
    }

    // ─── Accessors ───

    public function getAmountRubAttribute(): float
    {
        return $this->amount / 100;
    }
}
