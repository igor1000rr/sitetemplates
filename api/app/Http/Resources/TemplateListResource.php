<?php
// ═══ app/Http/Resources/TemplateListResource.php ═══
// Облегчённый формат для каталога

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TemplateListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'short_desc' => $this->short_desc,
            'price' => $this->price,
            'price_rub' => $this->price_rub,
            'old_price' => $this->old_price,
            'old_price_rub' => $this->old_price_rub,
            'discount_percent' => $this->discount_percent,
            'template_type' => $this->template_type,
            'features' => $this->features,
            'rating' => $this->rating,
            'reviews_count' => $this->reviews_count,
            'sales_count' => $this->sales_count,
            'is_featured' => $this->is_featured,
            'category' => [
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ],
            'platform' => [
                'name' => $this->platform->name,
                'slug' => $this->platform->slug,
            ],
            'image' => $this->mainImage?->path,
            'demo_url' => $this->demo_url,
            'published_at' => $this->published_at?->toISOString(),
        ];
    }
}
