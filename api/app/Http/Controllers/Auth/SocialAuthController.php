<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\WelcomeNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    protected array $providers = ['google', 'yandex'];

    public function redirect(string $provider)
    {
        if (!in_array($provider, $this->providers)) {
            return response()->json(['message' => 'Неподдерживаемый провайдер'], 400);
        }

        $url = Socialite::driver($provider)
            ->stateless()
            ->redirect()
            ->getTargetUrl();

        return response()->json(['url' => $url]);
    }

    public function callback(string $provider, Request $request)
    {
        if (!in_array($provider, $this->providers)) {
            return response()->json(['message' => 'Неподдерживаемый провайдер'], 400);
        }

        try {
            $socialUser = Socialite::driver($provider)->stateless()->user();
        } catch (\Exception $e) {
            // Редирект на фронт с ошибкой
            $frontUrl = config('app.frontend_url', 'http://localhost:3000');
            return redirect($frontUrl . '/auth/login?error=social_auth_failed');
        }

        $email = $socialUser->getEmail();

        if (!$email) {
            $frontUrl = config('app.frontend_url', 'http://localhost:3000');
            return redirect($frontUrl . '/auth/login?error=no_email');
        }

        // Ищем или создаём пользователя
        $user = User::where('email', $email)->first();
        $isNew = false;

        if (!$user) {
            $isNew = true;
            $user = User::create([
                'name' => $socialUser->getName() ?? explode('@', $email)[0],
                'email' => $email,
                'password' => Hash::make(Str::random(32)),
                'email_verified_at' => now(),
                'social_provider' => $provider,
                'social_id' => $socialUser->getId(),
                'avatar' => $socialUser->getAvatar(),
            ]);
        } else {
            // Обновляем social данные
            $user->update([
                'social_provider' => $user->social_provider ?? $provider,
                'social_id' => $user->social_id ?? $socialUser->getId(),
                'avatar' => $user->avatar ?? $socialUser->getAvatar(),
            ]);
        }

        if ($isNew) {
            try {
                $user->notify(new WelcomeNotification());
            } catch (\Exception $e) {}
        }

        // Генерируем токен. Отдаём его НЕ в URL, а по одноразовому коду обмена —
        // токен в query-строке утекает в логи сервера, историю браузера и Referer.
        $token = $user->createToken('auth-token')->plainTextToken;

        $code = Str::random(64);
        Cache::put("social_auth:{$code}", $token, now()->addMinutes(2));

        $frontUrl = config('app.frontend_url', 'http://localhost:3000');
        return redirect($frontUrl . '/auth/callback?code=' . $code);
    }

    /**
     * POST /api/auth/social/exchange — обменять одноразовый код на токен.
     * Код живёт 2 минуты и используется только один раз (Cache::pull).
     */
    public function exchange(Request $request): \Illuminate\Http\JsonResponse
    {
        $data = $request->validate(['code' => 'required|string|max:128']);

        $token = Cache::pull("social_auth:{$data['code']}");

        if (!$token) {
            return response()->json(['message' => 'Код недействителен или истёк'], 422);
        }

        return response()->json(['token' => $token]);
    }
}
