<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;

/**
 * پاسخ‌ساز استاندارد API — قرارداد ثابت با نسخه فعلی:
 *   موفق:        { "data": ... }
 *   صفحه‌بندی:   { "data": [...], "meta": { current_page, last_page, per_page, total, from, to } }
 */
final class ApiResponder
{
    public static function ok(mixed $data, int $status = 200): JsonResponse
    {
        return response()->json(['data' => $data], $status);
    }

    /** @param array<int, mixed> $items */
    public static function page(array $items, int $total, int $page, int $perPage): JsonResponse
    {
        $perPage = max(1, $perPage);
        $page = max(1, $page);
        return response()->json([
            'data' => $items,
            'meta' => [
                'current_page' => $page,
                'last_page' => max(1, (int) ceil($total / $perPage)),
                'per_page' => $perPage,
                'total' => $total,
                'from' => $total === 0 ? 0 : ($page - 1) * $perPage + 1,
                'to' => $total === 0 ? 0 : min($page * $perPage, $total),
            ],
        ]);
    }

    /** خواندن امن عدد از کوئری (معادل intParam) */
    public static function intParam(mixed $value, int $fallback): int
    {
        if ($value === null || $value === '') {
            return $fallback;
        }
        $n = is_numeric($value) ? (int) $value : $fallback;
        return $n >= 0 ? $n : $fallback;
    }
}
