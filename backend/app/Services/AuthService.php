<?php

namespace App\Services;

use App\Support\ApiException;
use App\Support\DemoHash;
use App\Support\Dto;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * پورت کامل auth.service.ts — رفتار یکسان با API فعلی:
 * ثبت‌نام/ورود، OTP (devCode)، فراموشی/بازنشانی رمز، پروفایل، آواتار، خروج.
 */
final class AuthService
{
    private static function findByIdentity(string $identity): ?object
    {
        $id = mb_strtolower(trim($identity));
        return Dto::rows('users')->first(
            fn (object $u) => ($u->phone === trim($identity) || mb_strtolower((string) $u->email) === $id) && !$u->deleted_at,
        );
    }

    private static function createWallet(int $userId): void
    {
        DB::table('wallets')->insert([
            'user_id' => $userId, 'balance' => 0, 'created_at' => Dto::now(), 'updated_at' => Dto::now(),
        ]);
        Dto::flush();
    }

    private static function authResult(object $user, bool $firstLogin = false): array
    {
        return [
            'user' => Dto::userDto($user),
            'token' => Dto::issueToken((int) $user->id),
            'tokenType' => 'Bearer',
            'firstLogin' => $firstLogin,
        ];
    }

    // ─── ثبت‌نام ───
    public static function register(array $input): array
    {
        if (Dto::rows('users')->contains('phone', $input['phone'])) {
            throw ApiException::unprocessable(['phone' => ['این شماره موبایل قبلاً ثبت شده است']]);
        }
        if (!empty($input['email']) && Dto::rows('users')->contains(fn (object $u) => mb_strtolower((string) $u->email) === mb_strtolower($input['email']))) {
            throw ApiException::unprocessable(['email' => ['این ایمیل قبلاً ثبت شده است']]);
        }
        $id = DB::table('users')->insertGetId([
            'first_name' => $input['first_name'], 'last_name' => $input['last_name'],
            'email' => $input['email'] ?? null, 'phone' => $input['phone'],
            'password' => DemoHash::hash($input['password']),
            'national_code' => null, 'avatar' => null, 'birth_date' => null, 'gender' => null,
            'email_verified_at' => null, 'phone_verified_at' => Dto::now(),
            'status' => 'active', 'role' => 'customer', 'remember_token' => null,
            'created_at' => Dto::now(), 'updated_at' => Dto::now(), 'deleted_at' => null,
        ]);
        self::createWallet($id);
        Dto::flush();
        // معادل listener رویداد UserRegistered
        Dto::notify($id, 'system', 'به گینان‌کالا خوش آمدید', "{$input['first_name']} عزیز، حساب کاربری شما با موفقیت ایجاد شد.");
        Dto::logActivity($id, 'user.register', 'user', $id, 'ثبت‌نام کاربر جدید');
        return self::authResult(Dto::find('users', $id), true);
    }

    // ─── ورود ───
    public static function login(string $identity, string $password): array
    {
        $user = self::findByIdentity($identity);
        if (!$user || !DemoHash::check($password, (string) $user->password)) {
            throw new ApiException(401, 'اطلاعات ورود صحیح نیست');
        }
        if ($user->status === 'banned') {
            throw new ApiException(403, 'حساب شما مسدود شده است؛ با پشتیبانی تماس بگیرید');
        }
        if (!$user->phone_verified_at) {
            DB::table('users')->where('id', $user->id)->update(['phone_verified_at' => Dto::now()]);
        }
        return self::authResult($user);
    }

    // ─── OTP ───
    public static function sendOtp(string $phone, string $purpose = 'login'): array
    {
        $user = Dto::rows('users')->first(fn (object $u) => $u->phone === $phone && !$u->deleted_at);
        if ($purpose === 'reset' && !$user) {
            throw ApiException::unprocessable(['identity' => ['کاربری با این مشخصات یافت نشد']]);
        }
        // باطل‌سازی کدهای قبلی
        DB::table('otp_codes')->where('phone', $phone)->whereNull('used_at')->update(['used_at' => Dto::now()]);
        $code = DemoHash::digits(5);
        DB::table('otp_codes')->insert([
            'phone' => $phone, 'code' => $code,
            'expired_at' => Dto::future(120),
            'used_at' => null, 'created_at' => Dto::now(), 'updated_at' => Dto::now(),
        ]);
        Dto::flush();
        // در پروداکشن: SendSMS Job با کاوه‌نگار/قاصدک
        Log::info("[OTP SMS → {$phone}] کد تایید: {$code}");
        return ['devCode' => $code, 'expiresIn' => 120, 'channel' => 'sms'];
    }

    private static function consumeOtp(string $phone, string $code): void
    {
        $otp = Dto::rows('otp_codes')->where('phone', $phone)->whereNull('used_at')->sortByDesc('id')->first();
        if (!$otp || $otp->code !== $code) {
            throw ApiException::unprocessable(['code' => ['کد تایید وارد شده صحیح نیست']]);
        }
        if (strtotime((string) $otp->expired_at) < time()) {
            throw ApiException::unprocessable(['code' => ['کد تایید منقضی شده است؛ دوباره درخواست دهید']]);
        }
        DB::table('otp_codes')->where('id', $otp->id)->update(['used_at' => Dto::now()]);
        Dto::flush();
    }

    public static function verifyOtp(string $phone, string $code): array
    {
        self::consumeOtp($phone, $code);
        $user = Dto::rows('users')->first(fn (object $u) => $u->phone === $phone && !$u->deleted_at);
        if ($user) {
            if ($user->status === 'banned') {
                throw new ApiException(403, 'حساب شما مسدود شده است');
            }
            if (!$user->phone_verified_at) {
                DB::table('users')->where('id', $user->id)->update(['phone_verified_at' => Dto::now()]);
            }
            return self::authResult($user);
        }
        // ورود خودکار = ثبت‌نام (سبک دیجی‌کالا)
        $id = DB::table('users')->insertGetId([
            'first_name' => 'کاربر', 'last_name' => 'گینان‌کالا',
            'email' => null, 'phone' => $phone,
            'password' => DemoHash::hash(DemoHash::digits(10)),
            'national_code' => null, 'avatar' => null, 'birth_date' => null, 'gender' => null,
            'email_verified_at' => null, 'phone_verified_at' => Dto::now(),
            'status' => 'active', 'role' => 'customer', 'remember_token' => null,
            'created_at' => Dto::now(), 'updated_at' => Dto::now(), 'deleted_at' => null,
        ]);
        self::createWallet($id);
        Dto::flush();
        Dto::notify($id, 'system', 'به گینان‌کالا خوش آمدید', "کاربر عزیز، حساب کاربری شما با موفقیت ایجاد شد.");
        Dto::logActivity($id, 'user.register', 'user', $id, 'ثبت‌نام کاربر جدید');
        return self::authResult(Dto::find('users', $id), true);
    }

    // ─── فراموشی رمز ───
    public static function forgotPassword(string $identity): array
    {
        $user = self::findByIdentity($identity);
        if (!$user) {
            throw ApiException::unprocessable(['identity' => ['کاربری با این مشخصات یافت نشد']]);
        }
        return self::sendOtp((string) $user->phone, 'reset');
    }

    public static function resetPassword(string $identity, string $code, string $password): void
    {
        $user = self::findByIdentity($identity);
        if (!$user) {
            throw ApiException::unprocessable(['identity' => ['کاربری با این مشخصات یافت نشد']]);
        }
        self::consumeOtp((string) $user->phone, $code);
        DB::table('users')->where('id', $user->id)->update([
            'password' => DemoHash::hash($password), 'updated_at' => Dto::now(),
        ]);
        // ابطال همه توکن‌های فعال
        DB::table('personal_access_tokens')->where('user_id', $user->id)->whereNull('revoked_at')
            ->update(['revoked_at' => Dto::now()]);
    }

    // ─── پروفایل ───
    public static function updateProfile(object $user, array $patch): array
    {
        if (!empty($patch['email'])) {
            $clash = Dto::rows('users')->first(
                fn (object $u) => $u->id !== $user->id && mb_strtolower((string) $u->email) === mb_strtolower($patch['email']),
            );
            if ($clash) {
                throw ApiException::unprocessable(['email' => ['این ایمیل توسط کاربر دیگری استفاده شده است']]);
            }
            if ($patch['email'] !== $user->email) {
                $patch['email_verified_at'] = null;
            }
        }
        $patch['updated_at'] = Dto::now();
        DB::table('users')->where('id', $user->id)->update($patch);
        Dto::flush();
        return Dto::userDto(Dto::find('users', (int) $user->id));
    }

    public static function changePassword(object $user, string $current, string $new): void
    {
        if (!DemoHash::check($current, (string) $user->password)) {
            throw ApiException::unprocessable(['current_password' => ['رمز عبور فعلی صحیح نیست']]);
        }
        DB::table('users')->where('id', $user->id)->update([
            'password' => DemoHash::hash($new), 'updated_at' => Dto::now(),
        ]);
        Dto::notify((int) $user->id, 'system', 'رمز عبور تغییر کرد', 'رمز عبور حساب شما با موفقیت تغییر یافت.');
    }

    public static function setAvatar(object $user, string $payload): array
    {
        $mimeMap = ['data:image/png' => 'png', 'data:image/jpeg' => 'jpg', 'data:image/webp' => 'webp'];
        $avatar = null;
        foreach ($mimeMap as $mime => $ext) {
            if (str_starts_with($payload, $mime)) {
                $base64 = explode(',', $payload, 2)[1] ?? null;
                if (!$base64) {
                    throw ApiException::unprocessable(['avatar' => ['فایل تصویر معتبر نیست']]);
                }
                if (strlen($base64) > 3_000_000) {
                    throw ApiException::unprocessable(['avatar' => ['حجم تصویر نباید بیش از ۲ مگابایت باشد']]);
                }
                $dir = public_path('uploads/avatars');
                if (!is_dir($dir)) {
                    mkdir($dir, 0755, true);
                }
                $file = "{$user->id}.{$ext}";
                file_put_contents("{$dir}/{$file}", base64_decode($base64));
                $avatar = "/uploads/avatars/{$file}?v=" . time();
                break;
            }
        }
        if ($avatar === null) {
            if (str_starts_with($payload, '/')) {
                $avatar = $payload;
            } else {
                throw ApiException::unprocessable(['avatar' => ['فرمت تصویر معتبر نیست']]);
            }
        }
        DB::table('users')->where('id', $user->id)->update(['avatar' => $avatar, 'updated_at' => Dto::now()]);
        Dto::flush();
        return Dto::userDto(Dto::find('users', (int) $user->id));
    }

    public static function logout(?string $rawToken): void
    {
        if ($rawToken) {
            DB::table('personal_access_tokens')->where('token', $rawToken)->update(['revoked_at' => Dto::now()]);
        }
    }
}
