<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class AuthorProfile extends Model
{
    protected $fillable = [
        'user_id', 'display_name', 'slug', 'bio', 'avatar',
        'specialization', 'website', 'social_links', 'portfolio_images',
        'commission', 'balance', 'total_earned', 'total_sales',
        'payout_details', 'payout_method', 'is_verified',
    ];

    protected $casts = [
        'is_verified' => 'boolean',
        'social_links' => 'array',
        'portfolio_images' => 'array',
    ];

    // ─── Relationships ───

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function templates()
    {
        return $this->hasManyThrough(Template::class, User::class, 'id', 'author_id', 'user_id', 'id');
    }

    public function payouts()
    {
        return $this->hasMany(Payout::class, 'author_id', 'user_id');
    }

    public function earnings()
    {
        return $this->hasMany(AuthorEarning::class, 'author_id', 'user_id');
    }

    // ─── Scopes ───

    public function scopeVerified($q)
    {
        return $q->where('is_verified', true);
    }

    // ─── Accessors ───

    public function getBalanceRubAttribute(): float
    {
        return $this->balance / 100;
    }

    public function getTotalEarnedRubAttribute(): float
    {
        return $this->total_earned / 100;
    }

    // ─── Helpers ───

    public static function generateSlug(string $name): string
    {
        $slug = Str::slug($name);
        $n = 1;
        while (static::where('slug', $slug)->exists()) {
            $slug = Str::slug($name) . '-' . $n++;
        }
        return $slug;
    }

    /**
     * Начислить заработок за продажу
     */
    public function creditEarning(int $saleAmount): int
    {
        $authorAmount = (int) round($saleAmount * $this->commission / 100);
        $this->increment('balance', $authorAmount);
        $this->increment('total_earned', $authorAmount);
        $this->increment('total_sales');
        return $authorAmount;
    }

    /**
     * Списать при выводе
     */
    public function debitPayout(int $amount): bool
    {
        if ($this->balance < $amount) return false;
        $this->decrement('balance', $amount);
        return true;
    }
}
