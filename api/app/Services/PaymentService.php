<?php

namespace App\Services;

use App\Models\Order;
use YooKassa\Client;

class PaymentService
{
    private Client $client;

    public function __construct()
    {
        $this->client = new Client();
        $shopId = config('yukassa.shop_id');
        $secretKey = config('yukassa.secret_key');
        if ($shopId && $secretKey) {
            $this->client->setAuth((int) $shopId, $secretKey);
        }
    }

    /**
     * Создать платёж в ЮKassa
     */
    public function createPayment(Order $order): array
    {
        $payment = $this->client->createPayment([
            'amount' => [
                'value' => number_format($order->total / 100, 2, '.', ''),
                'currency' => 'RUB',
            ],
            'confirmation' => [
                'type' => 'redirect',
                'return_url' => config('app.frontend_url') . '/checkout/success?order=' . $order->order_number,
            ],
            'capture' => true,
            'description' => "Заказ {$order->order_number}",
            'metadata' => [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
            ],
        ], uniqid('', true));

        // Сохраняем ID платежа
        $order->update([
            'payment_id' => $payment->getId(),
            'status' => 'processing',
        ]);

        return [
            'payment_id' => $payment->getId(),
            'confirmation_url' => $payment->getConfirmation()->getConfirmationUrl(),
        ];
    }

    /**
     * Получить информацию о платеже из ЮKassa
     */
    public function getPayment(string $paymentId): ?\YooKassa\Request\Payments\PaymentResponse
    {
        try {
            return $this->client->getPaymentInfo($paymentId);
        } catch (\Throwable $e) {
            return null;
        }
    }
}
