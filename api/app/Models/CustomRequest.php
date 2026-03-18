<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomRequest extends Model
{
    protected $fillable = [
        'name', 'email', 'phone', 'company', 'business_type',
        'budget_range', 'deadline', 'description', 'reference_urls',
        'preferred_platform', 'status', 'assigned_to', 'admin_notes',
        'estimated_price',
    ];

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}
