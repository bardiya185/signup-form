<?php

namespace App\Support;

/**
 * خطای کنترل‌شده API — معادل ApiError بک‌اند فعلی (HttpException لاراول)
 * پاسخ JSON: { message, errors? } با کد وضعیت دلخواه
 */
class ApiException extends \RuntimeException
{
    /** @param array<string, string[]>|null $errors */
    public function __construct(
        public readonly int $status,
        string $message,
        public readonly ?array $errors = null,
    ) {
        parent::__construct($message);
    }

    /** @param array<string, string[]> $errors */
    public static function unprocessable(array $errors, string $message = 'اطلاعات وارد شده معتبر نیست'): self
    {
        return new self(422, $message, $errors);
    }

    public static function unauthorized(string $message = 'برای دسترسی به این بخش وارد حساب کاربری شوید'): self
    {
        return new self(401, $message);
    }

    public static function forbidden(string $message = 'شما مجوز انجام این عملیات را ندارید'): self
    {
        return new self(403, $message);
    }

    public static function notFound(string $message = 'منبع مورد نظر یافت نشد'): self
    {
        return new self(404, $message);
    }
}
