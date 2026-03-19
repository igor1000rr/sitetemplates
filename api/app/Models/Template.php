<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Template extends Model
{
    protected static function booted(): void
    {
        static::saved(fn () => Cache::forget('templates:featured'));
        static::deleted(fn () => Cache::forget('templates:featured'));
    }
    protected $fillable = [
        'title', 'slug', 'description', 'short_desc',
        'price', 'old_price',
        'category_id', 'platform_id', 'author_id',
        'template_type', 'zip_path', 'zip_size', 'demo_url',
        'features', 'tags', 'tech_specs', 'version',
        'meta_title', 'meta_desc',
        'sales_count', 'views_count', 'rating', 'reviews_count',
        'status', 'is_featured', 'sort_order', 'published_at',
    ];

    protected $casts = [
        'features' => 'array',
        'tags' => 'array',
        'tech_specs' => 'array',
        'is_featured' => 'boolean',
        'published_at' => 'datetime',
        'price' => 'integer',
        'old_price' => 'integer',
        'rating' => 'float',
    ];

    // ─── Relationships ───

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function platform()
    {
        return $this->belongsTo(Platform::class);
    }

    public function images()
    {
        return $this->hasMany(TemplateImage::class)->orderBy('sort_order');
    }

    public function mainImage()
    {
        return $this->hasOne(TemplateImage::class)->where('is_main', true);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function approvedReviews()
    {
        return $this->hasMany(Review::class)->where('status', 'approved');
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    // ─── Scopes ───

    public function scopePublished(Builder $q): Builder
    {
        return $q->where('status', 'published');
    }

    public function scopeFeatured(Builder $q): Builder
    {
        return $q->where('is_featured', true);
    }

    public function scopeByCategory(Builder $q, string $slug): Builder
    {
        return $q->whereHas('category', fn ($c) => $c->where('slug', $slug));
    }

    public function scopeByPlatform(Builder $q, string $slug): Builder
    {
        return $q->whereHas('platform', fn ($c) => $c->where('slug', $slug));
    }

    public function scopeByType(Builder $q, string $type): Builder
    {
        return $q->where('template_type', $type);
    }

    public function scopePriceRange(Builder $q, ?int $min, ?int $max): Builder
    {
        if ($min) $q->where('price', '>=', $min);
        if ($max) $q->where('price', '<=', $max);
        return $q;
    }

    public function scopeSearch(Builder $q, string $search): Builder
    {
        return $q->where(function ($q) use ($search) {
            $q->where('title', 'ilike', "%{$search}%")
              ->orWhere('description', 'ilike', "%{$search}%")
              ->orWhere('short_desc', 'ilike', "%{$search}%");
        });
    }

    // ─── Accessors ───

    public function getPriceRubAttribute(): float
    {
        return $this->price / 100;
    }

    public function getOldPriceRubAttribute(): ?float
    {
        return $this->old_price ? $this->old_price / 100 : null;
    }

    public function getDiscountPercentAttribute(): ?int
    {
        if (!$this->old_price || $this->old_price <= $this->price) return null;
        return (int) round((1 - $this->price / $this->old_price) * 100);
    }

    // ─── Methods ───

    public function incrementViews(): void
    {
        $this->increment('views_count');
    }

    public function recalculateRating(): void
    {
        $stats = $this->approvedReviews()->selectRaw('AVG(rating) as avg, COUNT(*) as cnt')->first();
        $this->update([
            'rating' => round($stats->avg ?? 0, 1),
            'reviews_count' => $stats->cnt ?? 0,
        ]);
    }
}
