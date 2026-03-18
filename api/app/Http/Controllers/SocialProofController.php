<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class SocialProofController extends Controller
{
    /**
     * Return anonymized recent purchases for social proof toasts.
     * Cached for 5 minutes. Returns max 20 items.
     */
    public function recent()
    {
        $data = Cache::remember('social_proof_recent', 300, function () {
            $purchases = DB::table('orders')
                ->join('order_items', 'orders.id', '=', 'order_items.order_id')
                ->join('templates', 'order_items.template_id', '=', 'templates.id')
                ->join('users', 'orders.user_id', '=', 'users.id')
                ->where('orders.status', 'paid')
                ->where('orders.paid_at', '>', now()->subDays(7))
                ->select([
                    'users.name as user_name',
                    'templates.title as template_title',
                    'orders.paid_at',
                ])
                ->orderByDesc('orders.paid_at')
                ->limit(20)
                ->get();

            return $purchases->map(function ($p) {
                // Anonymize: "Алексей М." format
                $parts = explode(' ', trim($p->user_name));
                $firstName = $parts[0] ?? 'Покупатель';
                $lastInitial = isset($parts[1]) ? mb_substr($parts[1], 0, 1) . '.' : '';

                return [
                    'name' => $firstName . ($lastInitial ? ' ' . $lastInitial : ''),
                    'template' => $p->template_title,
                    'time' => $p->paid_at,
                ];
            })->values();
        });

        return response()->json($data);
    }
}
