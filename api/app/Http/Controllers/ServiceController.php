<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\JsonResponse;

class ServiceController extends Controller
{
    /**
     * GET /api/services
     * Публичный список активных услуг
     */
    public function index(): JsonResponse
    {
        $services = Service::active()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'name' => $s->name,
                'slug' => $s->slug,
                'short_description' => $s->short_description,
                'price' => $s->price,
                'price_rub' => $s->price_rub,
                'icon' => $s->icon,
                'category' => $s->category,
                'estimated_days' => $s->estimated_days,
                'is_popular' => $s->is_popular,
            ]);

        return response()->json($services);
    }
}
