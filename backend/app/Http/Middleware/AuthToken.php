<?php

namespace App\Http\Middleware;

use App\Support\ApiException;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * احراز هویت توکنی — معادل currentUser في guards.ts
 * توکن Bearer → جدول personal_access_tokens → کاربر فعال
 */
class AuthToken
{
    public static function userForToken(?string $raw): ?object
    {
        if (!$raw) {
            return null;
        }
        $token = DB::table('personal_access_tokens')->where('token', $raw)->first();
        if (!$token || $token->revoked_at) {
            return null;
        }
        if (strtotime((string) $token->expires_at) < time()) {
            return null;
        }
        DB::table('personal_access_tokens')->where('id', $token->id)
            ->update(['last_used_at' => \App\Support\Dto::now()]);
        $user = DB::table('users')->where('id', $token->user_id)->whereNull('deleted_at')->first();
        if (!$user || $user->status === 'banned') {
            return null;
        }
        return $user;
    }

    public static function attachUser(Request $request): ?object
    {
        $user = self::userForToken($request->bearerToken());
        if ($user) {
            $request->attributes->set('gnk_user', $user);
            $request->setUserResolver(static fn () => $user);
        }
        return $user;
    }

    public function handle(Request $request, Closure $next): mixed
    {
        if (!self::attachUser($request)) {
            throw ApiException::unauthorized();
        }
        return $next($request);
    }
}

// نکته برای جلوگیری از import اضافی: resolver بالا stdClass برمی‌گرداند.
