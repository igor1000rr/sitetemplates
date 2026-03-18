<?php

namespace App\Http\Controllers;

use App\Models\ReferralReward;
use App\Services\ReferralService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReferralController extends Controller
{
    /**
     * GET /api/referral/stats
     */
    public function stats(Request $request, ReferralService $service): JsonResponse
    {
        return response()->json($service->getStats($request->user()));
    }

    /**
     * GET /api/referral/rewards — история начислений
     */
    public function rewards(Request $request): JsonResponse
    {
        $rewards = ReferralReward::where('referrer_id', $request->user()->id)
            ->with(['referred:id,name,email', 'order:id,order_number,total'])
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json([
            'data' => $rewards->map(fn ($r) => [
                'id' => $r->id,
                'type' => $r->type,
                'amount_rub' => $r->amount / 100,
                'description' => $r->description,
                'referred_name' => $r->referred?->name,
                'order_number' => $r->order?->order_number,
                'created_at' => $r->created_at->format('d.m.Y H:i'),
            ]),
            'meta' => [
                'total' => $rewards->total(),
                'current_page' => $rewards->currentPage(),
                'last_page' => $rewards->lastPage(),
            ],
        ]);
    }

    /**
     * POST /api/referral/generate — сгенерировать/получить код
     */
    public function generate(Request $request, ReferralService $service): JsonResponse
    {
        $code = $service->generateCode($request->user());
        return response()->json([
            'referral_code' => $code,
            'referral_url' => $service->getReferralUrl($request->user()),
        ]);
    }
}
