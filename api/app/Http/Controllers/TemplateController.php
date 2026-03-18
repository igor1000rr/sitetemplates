<?php

namespace App\Http\Controllers;

use App\Http\Resources\TemplateListResource;
use App\Http\Resources\TemplateResource;
use App\Models\Template;
use Illuminate\Http\Request;

class TemplateController extends Controller
{
    /**
     * GET /api/templates
     * Каталог с фильтрами, поиском, сортировкой, пагинацией
     */
    public function index(Request $request)
    {
        $query = Template::published()
            ->with(['category', 'platform', 'mainImage']);

        // Фильтры
        if ($request->filled('category')) {
            $query->byCategory($request->category);
        }

        if ($request->filled('platform')) {
            $query->byPlatform($request->platform);
        }

        if ($request->filled('type')) {
            $query->byType($request->type);
        }

        if ($request->filled('price_min') || $request->filled('price_max')) {
            $query->priceRange(
                $request->price_min ? (int) $request->price_min * 100 : null,
                $request->price_max ? (int) $request->price_max * 100 : null
            );
        }

        if ($request->filled('search')) {
            $query->search($request->search);
        }

        if ($request->filled('features')) {
            // Фильтр по фичам: features=WooCommerce,Квиз
            $features = explode(',', $request->features);
            foreach ($features as $feature) {
                $query->whereJsonContains('features', trim($feature));
            }
        }

        // Сортировка
        $sort = $request->get('sort', 'popular');
        match ($sort) {
            'price_asc' => $query->orderBy('price', 'asc'),
            'price_desc' => $query->orderBy('price', 'desc'),
            'newest' => $query->orderBy('published_at', 'desc'),
            'rating' => $query->orderBy('rating', 'desc'),
            default => $query->orderBy('sales_count', 'desc'), // popular
        };

        $perPage = min((int) $request->get('per_page', 12), 48);
        $templates = $query->paginate($perPage);

        return TemplateListResource::collection($templates);
    }

    /**
     * GET /api/templates/featured
     * Избранные шаблоны для главной страницы
     */
    public function featured()
    {
        $templates = Template::published()
            ->featured()
            ->with(['category', 'platform', 'mainImage'])
            ->orderBy('sort_order')
            ->limit(6)
            ->get();

        return TemplateListResource::collection($templates);
    }

    /**
     * GET /api/templates/{slug}
     * Полная страница шаблона
     */
    public function show(string $slug)
    {
        $template = Template::published()
            ->where('slug', $slug)
            ->with(['category', 'platform', 'images', 'approvedReviews.user'])
            ->firstOrFail();

        $template->incrementViews();

        // Похожие шаблоны
        $similar = Template::published()
            ->where('category_id', $template->category_id)
            ->where('id', '!=', $template->id)
            ->with(['mainImage', 'platform'])
            ->limit(4)
            ->get();

        return response()->json([
            'template' => new TemplateResource($template),
            'similar' => TemplateListResource::collection($similar),
        ]);
    }
}
