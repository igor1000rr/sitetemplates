<?php
// ═══════════════════════════════════════
// app/Models/Category.php
// ═══════════════════════════════════════

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Category extends Model
{
    protected $fillable = ['name', 'slug', 'icon', 'description', 'sort_order', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    protected static function booted(): void
    {
        static::saved(fn () => Cache::forget('categories:all'));
        static::deleted(fn () => Cache::forget('categories:all'));
    }

    public function templates()
    {
        return $this->hasMany(Template::class);
    }

    public function publishedTemplates()
    {
        return $this->hasMany(Template::class)->where('status', 'published');
    }

    public function scopeActive($q)
    {
        return $q->where('is_active', true)->orderBy('sort_order');
    }
}
