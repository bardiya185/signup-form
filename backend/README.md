# بک‌اند لاراول گینان‌کالا (Phase 2 — در حال ساخت)

این پوشه پروژه‌ی رسمی **Laravel 12.x** است که قرارداد کامل API پلتفرم گینان‌کالا (همان ۱۱۱ مسیر `api/v1`) را پیاده‌سازی می‌کند تا در پروداکشن جایگزین بک‌اند موقت Next.js شود.

> ⚠️ **وضعیت:** اسکلت پروژه آماده است. مایگریشن‌ها، مدل‌ها، FormRequestها، کنترلرها و سیدرها در فازهای بعدی (۲ تا ۴ برنامه) اضافه می‌شوند. راهنمای کامل برنامه‌ی انتقال: ریشه‌ی ریپو → `docs/laravel-plan.md`.
> در حال حاضر بک‌اندِ در حال اجرای سایت همان Next.js API + دیتابیس واقعی SQLite است (`data/ginankala.sqlite`).

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
php artisan migrate --seed      # پس از افزوده‌شدن مایگریشن‌ها و سیدرها
php artisan serve --port=8000
```

یا با Docker (پس از تکمیل سرویس php در docker-compose ریشه):

```bash
docker compose up api
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
