<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

/**
 * احراز اختیاری — برای مسیرهایی مثل سبد خرید که مهمان هم دارد.
 * اگر توکن معتبر باشد کاربر ست می‌شود؛ وگرنه درخواست به‌صورت مهمان ادامه می‌یابد.
 */
class OptionalToken
{
    public function handle(Request $request, Closure $next): mixed
    {
        AuthToken::attachUser($request);
        return $next($request);
    }
}
