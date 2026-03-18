<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Platform extends Model
{
    protected $fillable = ['name', 'slug', 'is_active'];
    protected $casts = ['is_active' => 'boolean'];

    public function templates()
    {
        return $this->hasMany(Template::class);
    }

    public function scopeActive($q)
    {
        return $q->where('is_active', true);
    }
}
