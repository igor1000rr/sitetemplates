<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessPaymentWebhook;
use App\Support\IpRange;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    /**
     * POST /api/payment/webhook
     * ЮKassa отправляет сюда уведомления
     */
    public function webhook(Request $request)
    {
        // 1. Verify IP whitelist (ЮKassa known IPs)
        $allowedIps = [
            '185.71.76.0/27',
            '185.71.77.0/27',
            '77.75.153.0/25',
            '77.75.156.11',
            '77.75.156.35',
            '77.75.154.128/25',
            '2a02:5180::/32',
        ];

        $clientIp = $request->ip();
        $ipAllowed = false;

        foreach ($allowedIps as $range) {
            if (IpRange::contains($clientIp, $range)) {
                $ipAllowed = true;
                break;
            }
        }

        // IP-allowlist применяется во ВСЕХ окружениях. Обойти его можно только
        // явным флагом YUKASSA_ALLOW_INSECURE_WEBHOOK=true (для локальной разработки),
        // а не неявно по APP_ENV (staging/preview не должны принимать поддельные вебхуки).
        if (!$ipAllowed && !config('services.yookassa.allow_insecure_webhook', false)) {
            Log::warning("YooKassa webhook: rejected IP {$clientIp}");
            return response()->json(['status' => 'forbidden'], 403);
        }

        // 2. Authenticity is established by source IP (checked above) — YooKassa HTTP
        //    notifications are NOT signed with an HMAC header. The payment status is
        //    never trusted from the request body: ProcessPaymentWebhook re-fetches the
        //    payment from the YooKassa API and uses that as the source of truth.

        // 3. Process event
        $data = $request->all();
        $event = $data['event'] ?? null;

        if (!in_array($event, ['payment.succeeded', 'payment.canceled', 'refund.succeeded'])) {
            return response()->json(['status' => 'ignored']);
        }

        Log::info("YooKassa webhook: {$event}", [
            'payment_id' => $data['object']['id'] ?? 'unknown',
        ]);

        ProcessPaymentWebhook::dispatch($data);

        return response()->json(['status' => 'ok']);
    }
}
