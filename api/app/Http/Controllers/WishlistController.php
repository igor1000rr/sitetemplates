<?php

namespace App\Http\Controllers;

use App\Models\Wishlist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    /**
     * GET /api/wishlist — список избранных шаблонов
     */
    public function index(Request $request): JsonResponse
    {
        $templates = $request->user()
            ->wishlistTemplates()
            ->with(['category', 'platform'])
            ->orderByPivot('created_at', 'desc')
            ->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'title' => $t->title,
                'slug' => $t->slug,
                'preview_image' => $t->preview_image,
                'price_rub' => $t->price / 100,
                'old_price_rub' => $t->old_price ? $t->old_price / 100 : null,
                'category' => $t->category?->name,
                'platform' => $t->platform?->name,
                'rating' => $t->rating,
                'sales_count' => $t->sales_count,
                'added_at' => $t->pivot->created_at->format('d.m.Y'),
            ]);

        return response()->json(['data' => $templates]);
    }

    /**
     * POST /api/wishlist/toggle — добавить/удалить из избранного
     */
    public function toggle(Request $request): JsonResponse
    {
        $data = $request->validate([
            'template_id' => 'required|exists:templates,id',
        ]);

        $userId = $request->user()->id;
        $templateId = $data['template_id'];

        $existing = Wishlist::where('user_id', $userId)
            ->where('template_id', $templateId)
            ->first();

        if ($existing) {
            $existing->delete();
            return response()->json([
                'in_wishlist' => false,
                'message' => 'Удалено из избранного',
            ]);
        }

        Wishlist::create([
            'user_id' => $userId,
            'template_id' => $templateId,
        ]);

        return response()->json([
            'in_wishlist' => true,
            'message' => 'Добавлено в избранное',
        ]);
    }

    /**
     * GET /api/wishlist/check?ids=1,2,3 — проверить какие из шаблонов в избранном
     */
    public function check(Request $request): JsonResponse
    {
        $ids = explode(',', $request->query('ids', ''));
        $ids = array_filter(array_map('intval', $ids));

        if (empty($ids)) {
            return response()->json(['wishlist_ids' => []]);
        }

        $wishlistIds = Wishlist::where('user_id', $request->user()->id)
            ->whereIn('template_id', $ids)
            ->pluck('template_id')
            ->toArray();

        return response()->json(['wishlist_ids' => $wishlistIds]);
    }
}
