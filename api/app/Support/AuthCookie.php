<?php

namespace App\Support;

use Symfony\Component\HttpFoundation\Cookie as SymfonyCookie;

class AuthCookie
{
    public const NAME = 'auth_token';

    private const TTL_MINUTES = 60 * 24 * 30; // 30 дней

    /**
     * httpOnly-cookie с токеном Sanctum. Недоступна для JS — защищает токен
     * от кражи через XSS. Secure включается только в проде (HTTPS).
     */
    public static function make(string $token): SymfonyCookie
    {
        return cookie(
            self::NAME,
            $token,
            self::TTL_MINUTES,
            '/',
            null,
            app()->isProduction(), // secure
            true,                   // httpOnly
            false,                  // raw
            'lax'                   // sameSite
        );
    }

    public static function forget(): SymfonyCookie
    {
        return cookie(self::NAME, '', -1, '/', null, app()->isProduction(), true, false, 'lax');
    }
}
