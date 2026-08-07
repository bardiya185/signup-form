<?php

namespace App\Http\Middleware;

use App\Support\ApiException;
use Closure;
use Illuminate\Http\Request;

/**
 * بررسی نقش — استفاده: ->middleware('role:admin,super_admin')
 * نقش‌های پشتیبانی: super_admin | admin | seller | customer | warehouse
 */
class RequireRole
{
    public function handle(Request $request, Closure $next, string ...$roles): mixed
    {
        $user = AuthToken::attachUser($request);
        if (!$user) {
            throw ApiException::unauthorized();
        }
        if (!in_array($user->role, $roles, true)) {
            throw ApiException::forbidden();
        }
        return $next($request);
    }
}
