<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuthorEarning extends Model
{
    protected $fillable = [
        'author_id', 'order_id', 'order_item_id', 'template_id',
        'sale_amount', 'commission_percent', 'author_amount', 'platform_amount',
    ];

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function template()
    {
        return $this->belongsTo(Template::class);
    }

    // ─── Accessors ───

    public function getAuthorAmountRubAttribute(): float
    {
        return $this->author_amount / 100;
    }

    public function getSaleAmountRubAttribute(): float
    {
        return $this->sale_amount / 100;
    }
}
