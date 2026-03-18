<?php

namespace App\Models;

use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements FilamentUser
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'email', 'password', 'name', 'phone', 'role', 'avatar',
        'referral_code', 'referred_by', 'referral_balance', 'referral_total_earned',
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function canAccessPanel(Panel $panel): bool
    {
        return $this->isAdmin();
    }

    public function isAuthor(): bool
    {
        return $this->role === 'author';
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function authorProfile()
    {
        return $this->hasOne(AuthorProfile::class);
    }

    public function templates()
    {
        return $this->hasMany(Template::class, 'author_id');
    }

    public function earnings()
    {
        return $this->hasMany(AuthorEarning::class, 'author_id');
    }

    public function payouts()
    {
        return $this->hasMany(Payout::class, 'author_id');
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function activeSubscription()
    {
        return $this->hasOne(Subscription::class)->active();
    }

    /**
     * Есть ли активная подписка
     */
    public function hasActiveSubscription(): bool
    {
        return $this->subscriptions()->active()->exists();
    }

    public function wishlists()
    {
        return $this->hasMany(Wishlist::class);
    }

    public function wishlistTemplates()
    {
        return $this->belongsToMany(Template::class, 'wishlists')->withTimestamps();
    }

    public function downloads()
    {
        return $this->hasMany(Download::class);
    }
}
