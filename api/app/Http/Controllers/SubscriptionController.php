<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Services\SubscriptionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class SubscriptionController extends Controller
{
    /**
     * GET /api/subscriptions/plans — публичный список планов
     */
    public function plans(): JsonResponse
    {
        $plans = Cache::remember('subscription:plans', 1800, function () {
            return SubscriptionPlan::active()
                ->orderBy('sort_order')
                ->get()
                ->map(fn ($p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'slug' => $p->slug,
                    'description' => $p->description,
                    'price_rub' => $p->price / 100,
                    'annual_price_rub' => $p->annual_price ? $p->annual_price / 100 : null,
                    'monthly_from_annual' => $p->monthly_from_annual,
                    'downloads_per_month' => $p->downloads_per_month,
                    'features' => $p->features,
                    'is_popular' => $p->is_popular,
                ]);
        });

        return response()->json(['data' => $plans]);
    }

    /**
     * GET /api/subscriptions/my — текущая подписка пользователя
     */
    public function my(Request $request): JsonResponse
    {
        $sub = Subscription::where('user_id', $request->user()->id)
            ->with('plan')
            ->orderByDesc('created_at')
            ->first();

        if (!$sub) {
            return response()->json(['subscription' => null]);
        }

        return response()->json([
            'subscription' => [
                'id' => $sub->id,
                'plan' => [
                    'name' => $sub->plan->name,
                    'slug' => $sub->plan->slug,
                    'downloads_per_month' => $sub->plan->downloads_per_month,
                ],
                'billing_cycle' => $sub->billing_cycle,
                'status' => $sub->status,
                'is_active' => $sub->isActive(),
                'price_paid_rub' => $sub->price_paid / 100,
                'downloads_used' => $sub->downloads_used,
                'days_left' => $sub->days_left,
                'current_period_end' => $sub->current_period_end?->format('d.m.Y'),
                'cancelled_at' => $sub->cancelled_at?->format('d.m.Y H:i'),
                'created_at' => $sub->created_at->format('d.m.Y'),
            ],
        ]);
    }

    /**
     * POST /api/subscriptions/subscribe — оформить подписку
     */
    public function subscribe(Request $request, SubscriptionService $service): JsonResponse
    {
        $data = $request->validate([
            'plan_id' => 'required|exists:subscription_plans,id',
            'billing_cycle' => 'required|in:monthly,annual',
        ]);

        $plan = SubscriptionPlan::active()->findOrFail($data['plan_id']);

        try {
            $result = $service->createSubscription(
                $request->user(),
                $plan,
                $data['billing_cycle']
            );

            return response()->json([
                'message' => 'Перенаправляем на оплату...',
                'confirmation_url' => $result['confirmation_url'],
                'subscription_id' => $result['subscription_id'],
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /**
     * POST /api/subscriptions/cancel — отменить подписку
     */
    public function cancel(Request $request, SubscriptionService $service): JsonResponse
    {
        $sub = Subscription::where('user_id', $request->user()->id)
            ->active()
            ->first();

        if (!$sub) {
            return response()->json(['message' => 'Активная подписка не найдена'], 404);
        }

        $service->cancelSubscription($sub);

        return response()->json([
            'message' => "Подписка отменена. Доступ сохраняется до {$sub->current_period_end->format('d.m.Y')}",
        ]);
    }
}
