<?php
// ═══ app/Http/Middleware/AdminOnly.php ═══

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AdminOnly
{
    public function handle(Request $request, Closure $next)
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            abort(403, 'Доступ запрещён');
        }

        return $next($request);
    }
}
