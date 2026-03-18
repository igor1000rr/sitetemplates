<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AuthorOnly
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if (!$user || (!$user->isAuthor() && !$user->isAdmin())) {
            return response()->json(['message' => 'Author access required'], 403);
        }

        return $next($request);
    }
}
