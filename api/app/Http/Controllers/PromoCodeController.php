<?php

namespace App\Http\Controllers;

use App\Models\PromoCode;
use Illuminate\Http\Request;

class PromoCodeController extends Controller
{
    public function validate(Request $request)
    {
        $request->validate(['code' => 'required|string']);

        $promo = PromoCode::where('code', strtoupper($request->code))->first();

        if (!$promo || !$promo->isValid()) {
            return response()->json(['valid' => false, 'message' => 'Промокод не найден или истёк'], 422);
        }

        return response()->json([
            'valid' => true,
            'discount_type' => $promo->discount_type,
            'discount_value' => $promo->discount_value,
        ]);
    }
}
