<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Post extends Model
{
    protected $fillable = [
        'author_id', 'category_id', 'title', 'slug', 'excerpt', 'content',
        'cover_image', 'tags', 'status', 'meta_title', 'meta_desc',
        'views_count', 'reading_time', 'published_at',
    ];

    protected $casts = [
        'tags' => 'array',
        'published_at' => 'datetime',
    ];

    // ─── Relationships ───

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function category()
    {
        return $this->belongsTo(PostCategory::class, 'category_id');
    }

    // ─── Scopes ───

    public function scopePublished(Builder $q): Builder
    {
        return $q->where('status', 'published')
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }

    public function scopeByCategory(Builder $q, string $slug): Builder
    {
        return $q->whereHas('category', fn ($c) => $c->where('slug', $slug));
    }

    public function scopeByTag(Builder $q, string $tag): Builder
    {
        return $q->whereJsonContains('tags', $tag);
    }

    public function scopeSearch(Builder $q, string $search): Builder
    {
        return $q->where(function ($q) use ($search) {
            $q->where('title', 'ilike', "%{$search}%")
              ->orWhere('excerpt', 'ilike', "%{$search}%");
        });
    }

    // ─── Helpers ───

    public function incrementViews(): void
    {
        $this->increment('views_count');
    }

    public static function calculateReadingTime(string $content): int
    {
        $wordCount = str_word_count(strip_tags($content));
        return max(1, (int) ceil($wordCount / 200));
    }

    public static function generateSlug(string $title): string
    {
        $slug = Str::slug($title);
        $n = 1;
        while (static::where('slug', $slug)->exists()) {
            $slug = Str::slug($title) . '-' . $n++;
        }
        return $slug;
    }
}
