<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Support\Facades\Cache;

class LivePurchaseController extends Controller
{
    /**
     * Возвращает последние покупки (анонимизированные) для social proof.
     * Кэшируется на 5 минут чтобы не грузить БД.
     */
    public function recent()
    {
        $purchases = Cache::remember('live_purchases', 300, function () {
            return Order::where('status', 'paid')
                ->where('paid_at', '>', now()->subDays(7))
                ->with(['items.template:id,title,slug', 'user:id,name'])
                ->latest('paid_at')
                ->limit(20)
                ->get()
                ->map(function ($order) {
                    $name = $order->user?->name ?? 'Аноним';
                    // Анонимизируем: "Алексей М." вместо полного имени
                    $parts = explode(' ', $name);
                    $display = $parts[0];
                    if (isset($parts[1])) {
                        $display .= ' ' . mb_substr($parts[1], 0, 1) . '.';
                    }

                    $template = $order->items->first()?->template;

                    return [
                        'name' => $display,
                        'template' => $template?->title ?? 'Шаблон',
                        'slug' => $template?->slug,
                        'time' => $order->paid_at?->diffForHumans(),
                    ];
                })
                ->values()
                ->toArray();
        });

        return response()->json($purchases);
    }
}
