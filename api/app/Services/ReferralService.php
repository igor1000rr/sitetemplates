<?php

namespace App\Services;

use App\Models\Order;
use App\Models\ReferralReward;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ReferralService
{
    // Реферальный бонус: 10% от заказа реферала
    const COMMISSION_PERCENT = 10;

    // Бонус рефералу при первой покупке: 300₽
    const REFERRED_DISCOUNT = 30000; // копейки

    /**
     * Сгенерировать уникальный реферальный код
     */
    public function generateCode(User $user): string
    {
        if ($user->referral_code) {
            return $user->referral_code;
        }

        do {
            $code = strtoupper(Str::random(8));
        } while (User::where('referral_code', $code)->exists());

        $user->update(['referral_code' => $code]);
        return $code;
    }

    /**
     * Привязать реферала при регистрации
     */
    public function attachReferrer(User $newUser, string $code): bool
    {
        if ($newUser->referred_by) return false;

        $referrer = User::where('referral_code', $code)
            ->where('id', '!=', $newUser->id)
            ->first();

        if (!$referrer) return false;

        $newUser->update(['referred_by' => $referrer->id]);

        Log::info("Referral: user #{$newUser->id} referred by #{$referrer->id} (code: {$code})");
        return true;
    }

    /**
     * Начислить комиссию рефереру при оплате заказа
     */
    public function rewardForOrder(Order $order): void
    {
        $user = $order->user;
        if (!$user?->referred_by) return;

        $referrer = User::find($user->referred_by);
        if (!$referrer) return;

        $commission = (int) round($order->total * self::COMMISSION_PERCENT / 100);
        if ($commission <= 0) return;

        // Проверяем: уже начислено за этот заказ?
        $exists = ReferralReward::where('referrer_id', $referrer->id)
            ->where('order_id', $order->id)
            ->exists();
        if ($exists) return;

        ReferralReward::create([
            'referrer_id' => $referrer->id,
            'referred_id' => $user->id,
            'order_id' => $order->id,
            'type' => 'order_commission',
            'amount' => $commission,
            'description' => "Комиссия {$order->order_number} ({self::COMMISSION_PERCENT}%)",
        ]);

        $referrer->increment('referral_balance', $commission);
        $referrer->increment('referral_total_earned', $commission);

        Log::info("Referral reward: #{$referrer->id} earned {$commission} from order #{$order->id}");
    }

    /**
     * Получить реферальную ссылку
     */
    public function getReferralUrl(User $user): string
    {
        $code = $this->generateCode($user);
        return config('app.frontend_url') . '?ref=' . $code;
    }

    /**
     * Статистика реферера
     */
    public function getStats(User $user): array
    {
        $referrals = User::where('referred_by', $user->id)->count();
        $rewards = ReferralReward::where('referrer_id', $user->id);

        return [
            'referral_code' => $user->referral_code,
            'referral_url' => $this->getReferralUrl($user),
            'referrals_count' => $referrals,
            'total_earned_rub' => $user->referral_total_earned / 100,
            'balance_rub' => $user->referral_balance / 100,
            'rewards_count' => $rewards->count(),
            'commission_percent' => self::COMMISSION_PERCENT,
        ];
    }
}
