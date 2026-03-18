<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'status' => $this->status,
            'subtotal' => $this->subtotal,
            'discount' => $this->discount,
            'total' => $this->total,
            'total_rub' => $this->total_rub,
            'payment_method' => $this->payment_method,
            'paid_at' => $this->paid_at?->format('d.m.Y H:i'),
            'created_at' => $this->created_at->format('d.m.Y H:i'),
            'items' => $this->items->map(fn ($item) => [
                'id' => $item->id,
                'template_id' => $item->template_id,
                'price' => $item->price,
                'price_rub' => $item->price / 100,
                'template' => $item->template ? [
                    'title' => $item->template->title,
                    'slug' => $item->template->slug,
                    'image' => $item->template->mainImage?->path,
                    'platform' => $item->template->platform?->name,
                ] : null,
                'services' => $item->services->map(fn ($s) => [
                    'id' => $s->id,
                    'service_id' => $s->service_id,
                    'name' => $s->service?->name,
                    'price' => $s->price,
                    'price_rub' => $s->price / 100,
                    'status' => $s->status,
                ]),
            ]),
            'promo_code' => $this->whenLoaded('promoCode', fn () => $this->promoCode?->code),
        ];
    }
}
