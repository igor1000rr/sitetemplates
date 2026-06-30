<?php

namespace App\Jobs;

use App\Models\Order;
use App\Models\Download;
use App\Models\AuthorEarning;
use App\Services\OrderFulfillmentService;
use App\Services\TelegramService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProcessPaymentWebhook implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 30;

    public function __construct(
        public array $data
    ) {}

    public function handle(TelegramService $telegram): void
    {
        $event = $this->data['event'] ?? null;
        $object = $this->data['object'] ?? [];
        $paymentId = $object['id'] ?? null;

        if (!$event || !$paymentId) {
            Log::warning('ProcessPaymentWebhook: missing event or object id', $this->data);
            return;
        }

        // ─── Возврат: объект — это refund, исходный платёж лежит в payment_id ───
        if ($event === 'refund.succeeded') {
            $relatedPaymentId = $object['payment_id'] ?? null;
            if (!$relatedPaymentId) {
                Log::warning('ProcessPaymentWebhook: refund without payment_id', $this->data);
                return;
            }

            $order = Order::where('payment_id', $relatedPaymentId)
                ->with(['items.template'])
                ->first();

            if (!$order) {
                Log::error("ProcessPaymentWebhook: order not found for refunded payment {$relatedPaymentId}");
                return;
            }

            $this->handleRefund($order);
            return;
        }

        // ─── Платёжные события: никогда не доверяем телу запроса ───
        // Авторитетные статус, сумма и metadata берём из перезапрошенного платежа.
        $payment = $this->verifyPayment($paymentId, $object);
        if ($payment === null) {
            Log::warning("ProcessPaymentWebhook: could not verify payment {$paymentId} via API, retrying");
            $this->release(30);
            return;
        }

        $status = $payment['status'];

        // Тип платежа берём ТОЛЬКО из доверенной (API) metadata, не из тела вебхука
        $metadata = $payment['metadata'];
        $type = $metadata['type'] ?? 'order';

        if (in_array($type, ['subscription', 'subscription_renewal'])) {
            if ($status === 'succeeded') {
                try {
                    app(\App\Services\SubscriptionService::class)->handlePaymentSuccess($payment);
                } catch (\Throwable $e) {
                    Log::error("Subscription webhook error: {$e->getMessage()}");
                }
            }
            return;
        }

        $order = Order::where('payment_id', $paymentId)
            ->with(['user', 'items.template'])
            ->first();

        if (!$order) {
            Log::error("ProcessPaymentWebhook: order not found for payment {$paymentId}");
            return;
        }

        // Проверяем, что оплаченная сумма совпадает с суммой заказа
        if ($status === 'succeeded' && !$this->amountMatches($payment, $order->total)) {
            Log::error("ProcessPaymentWebhook: amount mismatch for order {$order->order_number}", [
                'expected' => $order->total,
                'paid' => $payment['amount']['value'] ?? null,
                'currency' => $payment['amount']['currency'] ?? null,
            ]);
            return;
        }

        match ($status) {
            'succeeded' => app(OrderFulfillmentService::class)->completeOrder($order, $payment['payment_method']),
            'canceled' => $this->handleCanceled($order),
            default => Log::info("ProcessPaymentWebhook: unhandled status {$status}"),
        };
    }

    /**
     * Авторитетные данные платежа из API ЮKassa: статус, сумма, metadata, способ оплаты.
     * Только если API не настроен (локальная разработка) — доверяем телу уведомления.
     *
     * @return array{status:string, amount:array{value:?string,currency:?string}, metadata:array, payment_method:?string}|null
     */
    private function verifyPayment(string $paymentId, array $bodyObject): ?array
    {
        if (!config('services.yookassa.shop_id') || !config('services.yookassa.secret_key')) {
            return [
                'status' => $bodyObject['status'] ?? '',
                'amount' => [
                    'value' => $bodyObject['amount']['value'] ?? null,
                    'currency' => $bodyObject['amount']['currency'] ?? null,
                ],
                'metadata' => $bodyObject['metadata'] ?? [],
                'payment_method' => $bodyObject['payment_method']['type'] ?? null,
                'payment_method_id' => $bodyObject['payment_method']['id'] ?? null,
            ];
        }

        $payment = app(\App\Services\PaymentService::class)->getPayment($paymentId);
        if (!$payment) {
            return null;
        }

        $metadata = [];
        $rawMeta = $payment->getMetadata();
        if ($rawMeta) {
            foreach ($rawMeta as $k => $v) {
                $metadata[$k] = $v;
            }
        }

        $amount = $payment->getAmount();
        $method = $payment->getPaymentMethod();

        return [
            'status' => (string) $payment->getStatus(),
            'amount' => [
                'value' => $amount ? (string) $amount->getValue() : null,
                'currency' => $amount ? (string) $amount->getCurrency() : null,
            ],
            'metadata' => $metadata,
            'payment_method' => $method ? (string) $method->getType() : null,
            'payment_method_id' => $method ? (string) $method->getId() : null,
        ];
    }

    /**
     * Сумма заказа хранится в копейках; ЮKassa возвращает рубли с двумя знаками.
     */
    private function amountMatches(array $payment, int $totalKopecks): bool
    {
        $expected = number_format($totalKopecks / 100, 2, '.', '');
        $paid = $payment['amount']['value'] ?? null;
        $currency = $payment['amount']['currency'] ?? null;

        if ($paid === null) {
            // Сумма из API недоступна (dev fallback) — не блокируем
            return true;
        }

        return number_format((float) $paid, 2, '.', '') === $expected
            && ($currency === null || $currency === 'RUB');
    }

    private function handleCanceled(Order $order): void
    {
        if ($order->status === 'cancelled') return;

        $order->update(['status' => 'cancelled']);
        Log::info("Order cancelled: {$order->order_number}");
    }

    private function handleRefund(Order $order): void
    {
        if ($order->status === 'refunded') return;

        DB::transaction(function () use ($order) {
            $locked = Order::whereKey($order->id)->lockForUpdate()->first();
            if (!$locked || $locked->status === 'refunded') {
                return;
            }

            $locked->update(['status' => 'refunded']);

            // Декремент продаж
            foreach ($order->items as $item) {
                if ($item->template) {
                    $item->template->decrement('sales_count');
                }
            }

            // Отменить заработки авторов
            $earnings = AuthorEarning::where('order_id', $order->id)->get();
            foreach ($earnings as $earning) {
                $profile = \App\Models\AuthorProfile::where('user_id', $earning->author_id)->first();
                if ($profile) {
                    $profile->decrement('balance', $earning->author_amount);
                    $profile->decrement('total_earned', $earning->author_amount);
                    $profile->decrement('total_sales');
                }
                $earning->delete();
            }

            // Откатить реферальную комиссию по этому заказу
            app(\App\Services\ReferralService::class)->reverseForOrder($order);

            // Удалить доступ к скачиванию
            Download::where('order_id', $order->id)->delete();
        });

        Log::info("Order refunded: {$order->order_number}");
    }
}
