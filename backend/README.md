# بک‌اند لاراول گینان‌کالا

این پوشه پروژه‌ی رسمی **Laravel 12.x** است که قرارداد کامل API پلتفرم گینان‌کالا (۱۴۱ مسیر `api/v1`) را پیاده‌سازی می‌کند تا در پروداکشن جایگزین بک‌اند موقت Next.js شود.

> ✅ **وضعیت:** هر ۵ فاز انجام شد: اسکلت کامل Laravel 12 + ۵۷ جدول مایگریشن (۱۲ ماژول) + ۵۶ مدل Eloquent + سیدر کل کاتالوگ (۴۲۳ رکورد واقعی از دیتابیس زنده) + **۱۴۱ اندپوینت** (فروشگاه، حساب کاربری، OTP/توکن، سبد/کوپن، چک‌اوت/پرداخت سندباکس/کیف‌پول، علاقه‌مندی/مقایسه/اعلان، دیدگاه/پرسش، تیکت، CMS + پنل‌های admin/seller/warehouse با گزارش‌ها و تنظیمات). صحت ایستا با `scripts/php-sanity.mjs` (۱۵۴ فایل) + `scripts/crosscheck-laravel.mjs` (۱۴۱ روت) تأیید شده است.

## معماری هدف

```
Next.js (فرانت) ──► Laravel API (پورت ۸۰۰۰) ──► MySQL/SQLite
      (NEXT_PUBLIC_API_URL=/api/v1 → پروکسی به لاراول)
```

## اجرا روی سیستم شما

نیازمندی: **PHP ≥ 8.2 + Composer** (یا Docker).

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve --port=8000
```

### تست دود روی لاراول

```bash
# در ترمینال دیگر (از ریشه مخزن):
node scripts/smoke-laravel.mjs        # BASE پیش‌فرض http://localhost:8000/api/v1
BASE=https://api.example.com/api/v1 node scripts/smoke-laravel.mjs
```

یا با Docker (پس از تکمیل سرویس php در docker-compose ریشه):

```bash
docker compose up -d --build
```

## قرارداد API (ثابت با نسخه فعلی)

- پاسخ موفق: `{ "data": ... }` و لیست‌ها: `{ "data": [...], "meta": { page, per_page, total, total_pages } }`
- خطای اعتبارسنجی: `422` → `{ "message", "errors": { field: [msgs] } }` با پیام‌های فارسی
- احراز: توکن Bearer (`Authorization: Bearer ...`) — معادل جدول `personal_access_tokens`
- نقش‌ها: `super_admin | admin | seller | customer | warehouse`

## نکته درباره سندباکس Arena

محیط سندباکس فقط Node دارد (بدون PHP/Composer و دسترسی به Packagist)، بنابراین اجرای لاراول
اینجا ممکن نیست؛ اما کل کد اینجا تولید و روی هر محیط استاندارد PHP قابل اجراست. برای توسعه‌ی
زنده در همین محیط، بک‌اند Next.js + SQLite (فاز ۱) فعال است و داده‌ها واقعاً روی دیسک ماندگارند.
