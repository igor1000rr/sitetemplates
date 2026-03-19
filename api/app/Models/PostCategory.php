<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class PostCategory extends Model
{
    protected static function booted(): void
    {
        static::saved(fn () => Cache::forget('blog:categories'));
        static::deleted(fn () => Cache::forget('blog:categories'));
    }

    protected $fillable = ['name', 'slug', 'description', 'sort_order'];

    public function posts()
    {
        return $this->hasMany(Post::class, 'category_id');
    }

    public function publishedPosts()
    {
        return $this->posts()->published();
    }
}
