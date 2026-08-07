<?php

/**
 * مسیرهای API گینان‌کالا — پیشوند: /api
 * قرارداد پاسخ: { data: ... } | { data: [...], meta: {...} }
 * خطاهای اعتبارسنجی: 422 { message, errors } با پیام‌های فارسی
 *
 * وضعیت: فاز ۳ (پیاده‌سازی کنترلرها) در راه — فعلاً health-check آماده است.
 */
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::get('/health', fn () => response()->json([
        'data' => [
            'status' => 'ok',
            'backend' => 'laravel',
            'version' => '12.x',
            'time' => now()->toIso8601String(),
        ],
    ]));
});
