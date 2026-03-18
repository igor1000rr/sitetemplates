<?php

namespace App\Http\Controllers;

use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\PromoCode;
use App\Models\Template;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function __construct(
        private PaymentService $paymentService
    ) {}

    /**
     * POST /api/orders
     * Создать заказ и получить ссылку на оплату
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.template_id' => 'required|integer|exists:templates,id',
            'items.*.services' => 'nullable|array',
            'items.*.services.*' => 'integer|exists:services,id',
            'promo_code' => 'nullable|string|max:50',
        ]);

        // Загружаем шаблоны
        $templateIds = collect($data['items'])->pluck('template_id')->unique()->toArray();
        $templates = Template::published()
            ->whereIn('id', $templateIds)
            ->get()
            ->keyBy('id');

        if ($templates->isEmpty()) {
            return response()->json(['message' => 'Шаблоны не найдены'], 422);
        }

        // Проверяем, не куплены ли уже
        $bought = $request->user()->orders()
            ->where('status', 'paid')
            ->whereHas('items', fn ($q) => $q->whereIn('template_id', $templateIds))
            ->exists();

        if ($bought) {
            return response()->json(['message' => 'Вы уже купили один из этих шаблонов'], 422);
        }

        // Считаем сумму (шаблоны + услуги)
        $subtotal = $templates->sum('price');

        // Загружаем выбранные услуги
        $allServiceIds = collect($data['items'])->flatMap(fn ($i) => $i['services'] ?? [])->unique()->toArray();
        $servicesMap = [];
        if (!empty($allServiceIds)) {
            $servicesMap = \App\Models\Service::active()->whereIn('id', $allServiceIds)->get()->keyBy('id');
        }

        // Считаем стоимость услуг
        $servicesTotal = 0;
        foreach ($data['items'] as $item) {
            foreach ($item['services'] ?? [] as $sId) {
                if (isset($servicesMap[$sId])) {
                    $servicesTotal += $servicesMap[$sId]->price;
                }
            }
        }
        $subtotal += $servicesTotal;
        $discount = 0;
        $promoCode = null;

        // Промокод
        if (!empty($data['promo_code'])) {
            $promoCode = PromoCode::where('code', strtoupper($data['promo_code']))->first();
            if ($promoCode && $promoCode->isValid($subtotal)) {
                $discount = $promoCode->calculateDiscount($subtotal);
            }
        }

        $total = max($subtotal - $discount, 0);

        // Создаём заказ
        $order = DB::transaction(function () use ($request, $data, $templates, $subtotal, $discount, $total, $promoCode, $servicesMap) {
            $order = Order::create([
                'order_number' => Order::generateNumber(),
                'user_id' => $request->user()->id,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'total' => $total,
                'promo_code_id' => $promoCode?->id,
                'status' => 'pending',
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            foreach ($data['items'] as $item) {
                $t = $templates[$item['template_id']] ?? null;
                if (!$t) continue;

                $orderItem = $order->items()->create([
                    'template_id' => $t->id,
                    'price' => $t->price,
                ]);

                // Сохраняем выбранные услуги
                foreach ($item['services'] ?? [] as $sId) {
                    if (isset($servicesMap[$sId])) {
                        $orderItem->services()->create([
                            'service_id' => $sId,
                            'price' => $servicesMap[$sId]->price,
                        ]);
                    }
                }
            }

            if ($promoCode) {
                $promoCode->increment('used_count');
            }

            return $order;
        });

        // Создаём платёж ЮKassa
        $payment = $this->paymentService->createPayment($order);

        // Telegram — новый заказ
        try {
            app(\App\Services\TelegramService::class)->notifyNewOrder(
                $order->load(['user', 'items.template'])
            );
        } catch (\Throwable $e) {}

        // Email — подтверждение заказа
        try {
            $order->user->notify(new \App\Notifications\OrderCreatedNotification($order));
        } catch (\Throwable $e) {}

        return response()->json([
            'order' => new OrderResource($order->load('items.template')),
            'payment_url' => $payment['confirmation_url'],
        ], 201);
    }

    /**
     * GET /api/orders
     * Мои заказы
     */
    public function index(Request $request)
    {
        $orders = $request->user()
            ->orders()
            ->with('items.template.mainImage')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return OrderResource::collection($orders);
    }

    /**
     * GET /api/orders/find/{orderNumber}
     * Найти заказ по номеру (для checkout/success)
     */
    public function findByNumber(Request $request, string $orderNumber)
    {
        $order = $request->user()
            ->orders()
            ->where('order_number', $orderNumber)
            ->with('items.template.mainImage', 'promoCode')
            ->first();

        if (!$order) {
            return response()->json(['message' => 'Заказ не найден'], 404);
        }

        return new OrderResource($order);
    }

    /**
     * GET /api/orders/{order}
     * Детали заказа
     */
    public function show(Request $request, Order $order)
    {
        if ($order->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            abort(403);
        }

        return new OrderResource($order->load('items.template.mainImage', 'promoCode'));
    }
}
