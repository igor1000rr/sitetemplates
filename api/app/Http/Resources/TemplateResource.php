<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TemplateResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'short_desc' => $this->short_desc,
            'price' => $this->price,
            'price_rub' => $this->price_rub,
            'old_price' => $this->old_price,
            'old_price_rub' => $this->old_price_rub,
            'discount_percent' => $this->discount_percent,
            'template_type' => $this->template_type,
            'features' => $this->features,
            'tags' => $this->tags,
            'tech_specs' => $this->tech_specs,
            'version' => $this->version,
            'rating' => $this->rating,
            'reviews_count' => $this->reviews_count,
            'sales_count' => $this->sales_count,
            'views_count' => $this->views_count,
            'demo_url' => $this->demo_url,
            'meta_title' => $this->meta_title,
            'meta_desc' => $this->meta_desc,
            'category' => [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ],
            'platform' => [
                'id' => $this->platform->id,
                'name' => $this->platform->name,
                'slug' => $this->platform->slug,
            ],
            'images' => $this->images->map(fn ($img) => [
                'id' => $img->id,
                'path' => $img->path,
                'alt' => $img->alt,
                'is_main' => $img->is_main,
            ]),
            'reviews' => $this->whenLoaded('approvedReviews', fn () =>
                $this->approvedReviews->take(5)->map(fn ($r) => [
                    'id' => $r->id,
                    'rating' => $r->rating,
                    'text' => $r->text,
                    'user' => $r->user->name,
                    'created_at' => $r->created_at->format('d.m.Y'),
                ])
            ),
            'published_at' => $this->published_at?->format('d.m.Y'),
        ];
    }
}
