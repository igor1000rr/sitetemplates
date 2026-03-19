<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Platform extends Model
{
    protected $fillable = ['name', 'slug', 'is_active'];
    protected $casts = ['is_active' => 'boolean'];

    protected static function booted(): void
    {
        static::saved(fn () => Cache::forget('platforms:all'));
        static::deleted(fn () => Cache::forget('platforms:all'));
    }

    public function templates()
    {
        return $this->hasMany(Template::class);
    }

    public function scopeActive($q)
    {
        return $q->where('is_active', true);
    }
}
