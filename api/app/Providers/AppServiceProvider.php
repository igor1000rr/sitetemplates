<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        $this->configureRateLimiting();
    }

    private function configureRateLimiting(): void
    {
        // Default API: 60 req/min
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by(
                $request->user()?->id ?: $request->ip()
            );
        });

        // Auth endpoints: brute-force protection.
        // Два лимита: по (email+IP) И жёсткий потолок по одному IP — чтобы
        // перебор паролей по списку email (password spraying) не обходил лимит
        // простой сменой email в каждом запросе.
        RateLimiter::for('auth', function (Request $request) {
            $tooMany = function () {
                return response()->json([
                    'message' => 'Слишком много попыток. Подождите минуту.',
                ], 429);
            };

            return [
                Limit::perMinute(5)
                    ->by(strtolower((string) $request->input('email', '')) . '|' . $request->ip())
                    ->response($tooMany),
                Limit::perMinute(20)->by($request->ip())->response($tooMany),
            ];
        });

        // Contact form: 3/min
        RateLimiter::for('contact', function (Request $request) {
            return Limit::perMinute(3)->by($request->ip());
        });

        // Reviews: 5/hour
        RateLimiter::for('reviews', function (Request $request) {
            return Limit::perHour(5)->by(
                $request->user()?->id ?: $request->ip()
            );
        });

        // Orders: 10/min
        RateLimiter::for('orders', function (Request $request) {
            return Limit::perMinute(10)->by(
                $request->user()?->id ?: $request->ip()
            );
        });
    }
}
