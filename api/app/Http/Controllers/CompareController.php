<?php

namespace App\Http\Controllers;

use App\Models\Template;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CompareController extends Controller
{
    /**
     * GET /api/compare?ids=1,2,3,4 — сравнение до 4 шаблонов
     */
    public function compare(Request $request): JsonResponse
    {
        $ids = explode(',', $request->query('ids', ''));
        $ids = array_filter(array_map('intval', $ids));

        if (count($ids) < 2) {
            return response()->json(['message' => 'Выберите минимум 2 шаблона'], 422);
        }

        if (count($ids) > 4) {
            $ids = array_slice($ids, 0, 4);
        }

        $templates = Template::whereIn('id', $ids)
            ->with(['category', 'platform', 'reviews'])
            ->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'title' => $t->title,
                'slug' => $t->slug,
                'preview_image' => $t->preview_image,
                'demo_url' => $t->demo_url,
                'price_rub' => $t->price / 100,
                'old_price_rub' => $t->old_price ? $t->old_price / 100 : null,
                'category' => $t->category?->name,
                'platform' => $t->platform?->name,
                'rating' => round($t->reviews->avg('rating'), 1) ?: null,
                'reviews_count' => $t->reviews->count(),
                'sales_count' => $t->sales_count,
                'description' => $t->description,
                'features' => $t->features,
                'tags' => $t->tags,
                'created_at' => $t->created_at->format('d.m.Y'),
            ]);

        return response()->json(['data' => $templates]);
    }
}
