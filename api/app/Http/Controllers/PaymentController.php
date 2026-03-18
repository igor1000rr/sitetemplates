<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessPaymentWebhook;
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
            if ($this->ipInRange($clientIp, $range)) {
                $ipAllowed = true;
                break;
            }
        }

        // В production проверяем IP, в dev — пропускаем
        if (!$ipAllowed && app()->isProduction()) {
            Log::warning("YooKassa webhook: rejected IP {$clientIp}");
            return response()->json(['status' => 'forbidden'], 403);
        }

        // 2. Verify webhook signature
        $secret = config('services.yookassa.webhook_secret');
        if ($secret) {
            $body = $request->getContent();
            $signature = $request->header('X-YooKassa-Signature');

            if (!$signature) {
                Log::warning('YooKassa webhook: missing signature');
                return response()->json(['status' => 'unauthorized'], 401);
            }

            $expected = hash_hmac('sha256', $body, $secret);
            if (!hash_equals($expected, $signature)) {
                Log::warning('YooKassa webhook: invalid signature');
                return response()->json(['status' => 'unauthorized'], 401);
            }
        } elseif (app()->isProduction()) {
            Log::error('YooKassa webhook: YUKASSA_WEBHOOK_SECRET not configured in production!');
            return response()->json(['status' => 'misconfigured'], 500);
        }

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

    /**
     * Check if IP is in CIDR range.
     */
    private function ipInRange(string $ip, string $range): bool
    {
        if (!str_contains($range, '/')) {
            return $ip === $range;
        }

        [$subnet, $bits] = explode('/', $range);

        // Skip IPv6 ranges for IPv4 addresses
        if (str_contains($subnet, ':') !== str_contains($ip, ':')) {
            return false;
        }

        if (str_contains($ip, ':')) {
            // IPv6
            $ipBin = inet_pton($ip);
            $subnetBin = inet_pton($subnet);
            if ($ipBin === false || $subnetBin === false) return false;

            $mask = str_repeat('f', (int)($bits / 4));
            $mask .= match ($bits % 4) {
                1 => '8', 2 => 'c', 3 => 'e', default => '',
            };
            $mask = str_pad($mask, 32, '0');
            $maskBin = pack('H*', $mask);

            return ($ipBin & $maskBin) === ($subnetBin & $maskBin);
        }

        // IPv4
        $ipLong = ip2long($ip);
        $subnetLong = ip2long($subnet);
        $mask = -1 << (32 - (int) $bits);
        return ($ipLong & $mask) === ($subnetLong & $mask);
    }
}
