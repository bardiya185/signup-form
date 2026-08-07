<?php

namespace App\Support;

/**
 * هش دمو — دقیقاً معادل security.ts بک‌اند فعلی (sha256 با salt) تا
 * هش‌های سید شده بدون تغییر کار کنند. در پروداکشن با bcrypt جایگزین می‌شود.
 */
final class DemoHash
{
    private static function salt(): string
    {
        return (string) (env('GNK_HASH_SALT') ?: 'gnk-demo-salt-2026');
    }

    public static function hash(string $plain): string
    {
        return hash('sha256', self::salt() . ':' . $plain);
    }

    public static function check(string $plain, string $hashed): bool
    {
        return hash_equals($hashed, self::hash($plain));
    }

    public static function token(): string
    {
        return bin2hex(random_bytes(32));
    }

    public static function digits(int $length): string
    {
        $min = 10 ** ($length - 1);
        $max = (10 ** $length) - 1;
        return (string) random_int($min, $max);
    }

    public static function refNumber(): string
    {
        return (string) random_int(10 ** 11, 10 ** 12 - 1);
    }
}
