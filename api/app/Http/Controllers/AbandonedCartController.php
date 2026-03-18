<?php

namespace App\Http\Controllers;

use App\Models\AbandonedCart;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AbandonedCartController extends Controller
{
    /**
     * POST /api/cart/save — сохранить корзину (для abandoned cart tracking)
     * Вызывается фронтом при добавлении в корзину / уходе со страницы
     */
    public function save(Request $request): JsonResponse
    {
        $data = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.template_id' => 'required|integer',
            'items.*.title' => 'required|string|max:300',
            'items.*.price' => 'required|integer',
            'total' => 'required|integer|min:1',
        ]);

        $userId = $request->user()->id;

        // Обновляем или создаём (одна корзина на пользователя)
        AbandonedCart::updateOrCreate(
            ['user_id' => $userId, 'recovered' => false, 'reminder_sent' => false],
            [
                'items' => $data['items'],
                'total' => $data['total'],
            ]
        );

        return response()->json(['ok' => true]);
    }

    /**
     * DELETE /api/cart/abandon — очистить abandoned cart (при покупке)
     */
    public function clear(Request $request): JsonResponse
    {
        AbandonedCart::where('user_id', $request->user()->id)
            ->where('recovered', false)
            ->update(['recovered' => true]);

        return response()->json(['ok' => true]);
    }
}
