# 🛍️ گینان‌کالا (GinanKala)

پلتفرم فروشگاه اینترنتی تمام‌عیار با الهام از دیجی‌کالا — **RTL کامل به زبان فارسی** با سبد خرید، درگاه پرداخت (سندباکس)، کیف پول، سفارش‌ها، اعلان‌ها، تیکت پشتیبانی، پنل فروشندگی و پنل مدیریت.

![Next.js](https://img.shields.io/badge/Next.js-15-black) ![React](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8)

---

## ⚡ اجرای سریع

```bash
npm ci
npm run dev -- --port 3000 --hostname 0.0.0.0
# → http://localhost:3000
```

> **نکته معماری:** در این مخزن، بک‌اند لاراولِ خواسته‌شده با **معادل دقیق** داخل Next.js پیاده شده است
> (مدل‌ها، FormRequestها، Resourceها، Sanctum توکن، رویداد/لیسنر، ریت‌لیمیت، کش تگ‌دار همه در `src/server/`).
> برای اتصال به بک‌اند لاراول واقعی کافی است `NEXT_PUBLIC_API_URL` را به API خارجی بدهید.
> نقشه‌ی کامل ماژول‌ها و endpointها: **[docs/architecture.md](docs/architecture.md)** — توپولوژی پروداکشن: **docker-compose.yml**.

## 🔑 حساب‌های دمو

| نقش | موبایل | رمز |
|---|---|---|
| مدیر | `09120000001` | `123456` |
| کاربر (سارا) | `09120000002` | `123456` |
| فروشنده (علی) | `09120000003` | `123456` |

- **ورود با OTP:** پس از ارسال کد، مقدار `devCode` (حالت توسعه) روی صفحه نمایش داده می‌شود.
- **کدهای تخفیف:** `GINAN10` (۱۰٪ تا سقف ۱۵۰هزار)، `SALAM100` (۱۰۰هزار ثابت)، `BOOK20` (۲۰٪ کتاب).

## 🧪 تست دود (E2E API)

```bash
npm run dev &          # سرور بالا باشد
node scripts/smoke.mjs # ۵۸ سناریو: auth→cart→checkout→payment→admin
```

## 🏗️ ساختار

```
src/
├── app/
│   ├── (shop)/            # صفحات فروشگاه (خانه، محصول، سبد، تسویه، پروفایل…)
│   ├── api/v1/            # ۱۱۱ endpoint ‏REST (معادل کنترلرهای لاراول)
│   ├── sitemap.ts / robots.ts
│   └── manifest + sw.js (PWA)
├── components/            # ui (کیت)، layout، home، product، checkout، profile، auth
├── hooks/                 # api.ts (کاتالوگ/سبد/Auth)، account.ts (سفارش/کیف‌پول/تیکت…)
├── lib/                   # http client، format (اعداد/تاریخ فارسی)، validators (Zod)
├── server/                # دامنه لاراولی: db + seed، repositories، services، resources
├── stores/                # Zustand: auth / ui (تم+toast) / search
└── types/                 # domain (snake_case میراث لاراول)، dto (camelCase)، account
```

## ✨ امکانات

- **کاتالوگ کامل:** مگامنو، فیلتر پویا (برند/رنگ/ویژگی/قیمت)، ۸ مرتب‌سازی، اسکرول بی‌نهایت، جستجوی پیشنهادی با debounce
- **صفحه محصول:** گالری، انتخاب تنوع رنگ/سایز، نمودار قیمت، دیدگاه و پرسش‌وپاسخ، تایمر شگفت‌انگیز، اطلاع‌ازموجودی، JSON-LD
- **خرید:** سبد خوش‌بینانه (optimistic)، کوپن، نوار پیشرفت ارسال رایگان، تسویه ۳ مرحله‌ای، درگاه سندباکس + کیف پول، کال‌بک تایید تراکنش
- **حساب کاربری:** سفارش‌ها + خط‌زمان، لغو/مرجوع، چاپ فاکتور، آدرس‌ها با استان→شهر، علاقه‌مندی، مقایسه، کیف پول + شارژ، اعلان‌ها، تیکت
- **تجربه کاربری:** دارک‌مود، ارقام و تاریخ فارسی (Intl fa-IR)، Framer Motion، PWA (مانیفست + Service Worker + آفلاین + A2HS)، سئو (متا/OG/sitemap/robots)
- **امنیت:** Rate Limiting، اعتبارسنجی فارسی سرور + Zod کلاینت، توکن Bearer، RBAC (ادمین/فروشنده/کاربر)

## 🐳 استک پروداکشن (مرجع)

`docker-compose.yml` شامل: app (Laravel/PHP-FPM)، next، mysql، redis، meilisearch، minio، nginx، mailhog
با Dockerfileهای آماده در `docker/` — از `backend/` به‌عنوان سورس لاراول استفاده کنید.
