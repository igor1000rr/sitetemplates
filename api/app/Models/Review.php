<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $fillable = ['template_id', 'user_id', 'rating', 'text', 'status'];

    public function template() { return $this->belongsTo(Template::class); }
    public function user() { return $this->belongsTo(User::class); }

    public function scopeApproved($q) { return $q->where('status', 'approved'); }
}
