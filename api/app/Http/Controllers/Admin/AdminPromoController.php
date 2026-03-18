<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PromoCode;
use Illuminate\Http\Request;

class AdminPromoController extends Controller
{
    public function index()
    {
        return PromoCode::orderBy('created_at', 'desc')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'code' => 'required|string|max:50|unique:promo_codes',
            'discount_type' => 'required|in:percent,fixed',
            'discount_value' => 'required|integer|min:1',
            'min_order' => 'nullable|integer',
            'max_uses' => 'nullable|integer',
            'expires_at' => 'nullable|date',
        ]);

        $promo = PromoCode::create($data);

        return response()->json($promo, 201);
    }

    public function update(Request $request, PromoCode $promo)
    {
        $data = $request->validate([
            'is_active' => 'sometimes|boolean',
            'max_uses' => 'sometimes|nullable|integer',
            'expires_at' => 'sometimes|nullable|date',
        ]);

        $promo->update($data);
        return response()->json($promo);
    }

    public function destroy(PromoCode $promo)
    {
        $promo->delete();
        return response()->json(['message' => 'Удалён']);
    }
}
