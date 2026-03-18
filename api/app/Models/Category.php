<?php
// ═══════════════════════════════════════
// app/Models/Category.php
// ═══════════════════════════════════════

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $fillable = ['name', 'slug', 'icon', 'description', 'sort_order', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

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
