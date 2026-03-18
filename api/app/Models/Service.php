<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $fillable = [
        'name', 'slug', 'short_description', 'description', 'price',
        'icon', 'category', 'estimated_days', 'is_popular', 'is_active', 'sort_order',
    ];

    protected $casts = [
        'is_popular' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function scopeActive($q)
    {
        return $q->where('is_active', true);
    }

    public function getPriceRubAttribute(): float
    {
        return $this->price / 100;
    }
}
