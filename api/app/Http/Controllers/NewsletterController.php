<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class NewsletterController extends Controller
{
    public function subscribe(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Некорректный email'], 422);
        }

        $email = strtolower(trim($request->email));

        $existing = DB::table('newsletter_subscribers')->where('email', $email)->first();

        if ($existing) {
            if ($existing->unsubscribed_at) {
                DB::table('newsletter_subscribers')
                    ->where('email', $email)
                    ->update(['unsubscribed_at' => null, 'subscribed_at' => now(), 'updated_at' => now()]);
            }
            return response()->json([
                'message' => 'Подписка оформлена!',
                'promo_code' => $existing->promo_code,
            ]);
        }

        // Generate personal promo code (10% off, single use, 30 days)
        $promoCode = 'WELCOME' . strtoupper(Str::random(4));

        DB::table('promo_codes')->insert([
            'code' => $promoCode,
            'discount_type' => 'percent',
            'discount_value' => 10,
            'max_uses' => 1,
            'used_count' => 0,
            'min_order' => 0,
            'is_active' => true,
            'expires_at' => now()->addDays(30),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('newsletter_subscribers')->insert([
            'email' => $email,
            'source' => $request->input('source', 'popup'),
            'ip' => $request->ip(),
            'promo_code' => $promoCode,
            'subscribed_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Log::info('Newsletter subscribe', ['promo' => $promoCode]); // без PII (email не логируем)

        return response()->json([
            'message' => 'Подписка оформлена!',
            'promo_code' => $promoCode,
        ]);
    }

    public function unsubscribe(Request $request)
    {
        $email = strtolower(trim($request->input('email', '')));
        $token = (string) $request->input('token', '');

        // Отписка только по подписанной ссылке из письма — иначе любой мог бы
        // отписать произвольный email и использовать эндпоинт как oracle существования.
        if ($email === '' || !hash_equals(self::unsubscribeToken($email), $token)) {
            return response()->json(['message' => 'Недействительная ссылка для отписки'], 422);
        }

        DB::table('newsletter_subscribers')
            ->where('email', $email)
            ->update(['unsubscribed_at' => now()]);

        return response()->json(['message' => 'Вы отписаны']);
    }

    /**
     * Подписанный токен отписки (HMAC от email). Встраивается в ссылки писем.
     */
    public static function unsubscribeToken(string $email): string
    {
        return hash_hmac('sha256', strtolower(trim($email)), config('app.key'));
    }
}
