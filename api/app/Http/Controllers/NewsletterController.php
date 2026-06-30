<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class NewsletterController extends Controller
{
    /**
     * Шаг 1: подписка. Промокод НЕ выдаётся и рассылка не активируется, пока
     * пользователь не подтвердит email по ссылке (double opt-in) — иначе можно
     * подписать произвольный чужой адрес.
     */
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

        // Уже подтверждён — отдаём существующий промокод
        if ($existing && $existing->confirmed_at) {
            return response()->json([
                'message' => 'Вы уже подписаны.',
                'promo_code' => $existing->promo_code,
            ]);
        }

        $token = Str::random(48);

        if ($existing) {
            DB::table('newsletter_subscribers')->where('email', $email)->update([
                'confirm_token' => $token,
                'source' => $request->input('source', $existing->source),
                'updated_at' => now(),
            ]);
        } else {
            DB::table('newsletter_subscribers')->insert([
                'email' => $email,
                'source' => $request->input('source', 'popup'),
                'ip' => $request->ip(),
                'confirm_token' => $token,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $this->sendConfirmation($email, $token);

        Log::info('Newsletter opt-in requested'); // без PII

        return response()->json([
            'pending' => true,
            'message' => 'Почти готово! Подтвердите подписку по ссылке в письме.',
        ]);
    }

    /**
     * Шаг 2: подтверждение по ссылке из письма. Здесь выдаём промокод и
     * активируем подписку.
     */
    public function confirm(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email|max:255',
            'token' => 'required|string|max:64',
        ]);

        $email = strtolower(trim($data['email']));
        $row = DB::table('newsletter_subscribers')->where('email', $email)->first();

        if (!$row || !$row->confirm_token || !hash_equals($row->confirm_token, $data['token'])) {
            return response()->json(['message' => 'Недействительная или устаревшая ссылка подтверждения.'], 422);
        }

        if ($row->confirmed_at) {
            return response()->json([
                'message' => 'Подписка уже подтверждена.',
                'promo_code' => $row->promo_code,
            ]);
        }

        // Персональный промокод (10%, одноразовый, 30 дней) — выдаём только при подтверждении
        $promoCode = $row->promo_code ?: 'WELCOME' . strtoupper(Str::random(4));

        if (!$row->promo_code) {
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
        }

        DB::table('newsletter_subscribers')->where('email', $email)->update([
            'promo_code' => $promoCode,
            'confirmed_at' => now(),
            'subscribed_at' => now(),
            'confirm_token' => null,
            'unsubscribed_at' => null,
            'updated_at' => now(),
        ]);

        return response()->json([
            'message' => 'Подписка подтверждена!',
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

    private function sendConfirmation(string $email, string $token): void
    {
        $confirmUrl = config('app.frontend_url') . '/newsletter/confirm?email=' . urlencode($email) . '&token=' . $token;

        try {
            Mail::send('emails.newsletter-confirm', ['confirmUrl' => $confirmUrl], function ($mail) use ($email) {
                $mail->to($email)->subject('Подтвердите подписку — AITempl');
            });
        } catch (\Throwable $e) {
            Log::warning('Newsletter confirmation email failed: ' . $e->getMessage());
        }
    }
}
