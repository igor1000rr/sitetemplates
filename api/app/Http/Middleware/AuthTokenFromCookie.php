<?php

namespace App\Http\Middleware;

use App\Support\AuthCookie;
use Closure;
use Illuminate\Http\Request;

/**
 * Если запрос пришёл без заголовка Authorization, но с httpOnly-cookie auth_token —
 * подставляем токен в заголовок Bearer, чтобы Sanctum аутентифицировал по нему.
 * Это позволяет хранить токен в httpOnly-cookie (недоступной JS), а не в localStorage.
 */
class AuthTokenFromCookie
{
    public function handle(Request $request, Closure $next)
    {
        if (!$request->headers->has('Authorization')) {
            $token = $request->cookie(AuthCookie::NAME);
            if (is_string($token) && $token !== '') {
                $request->headers->set('Authorization', 'Bearer ' . $token);
            }
        }

        return $next($request);
    }
}
