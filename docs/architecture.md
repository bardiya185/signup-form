# معماری گینان‌کالا (شبیه دیجی‌کالا)

## نکته اجرایی محیط Arena
در این محیط sandbox اجرای PHP/Composer/MySQL/Redis ممکن نیست؛ بنابراین بک‌اند لاراول
به‌صورت **معادل دقیق** داخل Next.js پیاده‌سازی شده تا همان API نهایی را بیرون بدهد و
بعداً بدون تغییر در فرانت، به Laravel واقعی متصل شود
(`NEXT_PUBLIC_API_URL=https://api.ginankala.ir/v1`).

## نگاشت مفاهیم Laravel → این پیاده‌سازی

| Laravel | معادل در این پروژه |
|---|---|
| Migrations + Eloquent Models | `src/types/domain.ts` (تمام ۱۲ ماژول اسکیما، فیلدبه‌فیلد) |
| Database (MySQL) | `src/server/db` — دیتابیس واقعی **SQLite** روی دیسک (`data/ginankala.sqlite`؛ لایه ماندگاری `sqlite.ts` با write-through اتمیک) + Seed واقع‌گرایانه (`src/server/db/data/*`) — آماده انتقال به MySQL لاراول در `backend/` (ر.ک. `docs/laravel-plan.md`) |
| Eloquent Queries / Scopes | `src/server/repositories/*.repository.ts` |
| API Resources | `src/server/serializers.ts` + `src/types/dto.ts` |
| Controllers + routes/api.php | `src/app/api/v1/**/route.ts` |
| فیلتر/صفحه‌بندی | `queryProducts` با خروجی `{ data, meta }` سبک لاراول |
| Meilisearch | `search.repository.ts` (رابط یکسان، پیاده‌سازی ساده — آماده جایگزینی) |
| Axios Client | `src/lib/api.ts` |

## اندپوینت‌های فعال (v1)

| Method | مسیر | شرح |
|---|---|---|
| GET | `/api/v1/home` | داده تجمیعی صفحه اصلی (بنر، شگفت‌انگیز، دسته‌ها، ویژه‌ها) |
| GET | `/api/v1/products` | فیلتر: category, brands, colors, attrs, q, min/max_price, in_stock, has_discount, sort, page, per_page, with_filters |
| GET | `/api/v1/products/{slug}` | جزییات محصول + مرتبط‌ها + پرسش‌ها |
| GET | `/api/v1/products/{slug}/reviews` | دیدگاه‌ها (صفحه‌بندی) |
| GET | `/api/v1/categories` | درخت دسته‌بندی |
| GET | `/api/v1/categories/{slug}` | دسته + فیلترهای در دسترس |
| GET | `/api/v1/brands` | برندها |
| GET | `/api/v1/banners?position=` | بنرها (hero/sidebar/category/product) |
| GET | `/api/v1/offers/incredible?type=` | پیشنهاد شگفت‌انگیز / فروش روزانه |
| GET | `/api/v1/search/suggest?q=` | پیشنهاد جستجو (محصول/دسته/برند) + ثبت search_logs |
| GET | `/api/v1/faqs` · `/api/v1/pages/{slug}` · `/api/v1/shipping-methods` | CMS و ارسال |

## سرویس‌ها و زیرساخت (پیاده‌شده در پرامپت ۲)

| نیاز لاراول | معادل پیاده‌سازی شده |
|---|---|
| Form Requests + پیام فارسی | `src/server/validate.ts` (Rule-based، تمام پیام‌ها فارسی) |
| Sanctum Tokens | `personal_access_tokens` + `issueToken`/گاردها در `guards.ts` |
| Policies/Role Middleware | `requireUser` / `requireRole` / `requireAdmin` + بررسی مالکیت |
| Exception Handling | `errors.ts#apiHandler` — خروجی یکدست `{message, errors}` |
| Rate Limiting | `rate-limit.ts` (اوت‌پی ۳/۲دقیقه، ورود ۶/دقیقه، ...) |
| Cache Tags (Redis) | `cache.ts` — `remember/flushTag` روی home/categories/geo |
| Events & Listeners | `events.ts` + `listeners.ts` — UserRegistered، OrderPlaced، OrderStatusChanged، PaymentVerified/Failed، StockDepleted |
| Service Layer | `src/server/services/*` — auth, cart, order, payment, address, library, ticket, wallet, notification, search, seller, admin, admin-catalog |
| Order/Payment State Machine | ترنزیشن‌های مجاز سفارش + idempotent `payments/verify` |
| درگاه پرداخت (Sandbox) | زرین‌پال/ملت/سامان — payUrl ساختگی + verify؛ کیف‌پول آنی |
| SMS (کاوه‌نگار/قاصدک) | OTP با `devCode` در پاسخ (حالت توسعه) + لاگ سرور |
| SEO | `app/sitemap.ts` (داینامیک از محصولات/دسته‌ها/بلاگ) + `robots.ts` |
| Activity Log | `activity_logs` برای تمام عملیات ادمین |
| تست | `scripts/smoke.mjs` — ۵۸ سناریوی End-to-End (اجرا: `node scripts/smoke.mjs`) |

### کاربران دمو
| نقش | موبایل | رمز |
|---|---|---|
| ادمین | 09120000001 | 123456 |
| مشتری (سارا) | 09120000002 | 123456 |
| فروشنده (علی) | 09120000003 | 123456 |
| OTP | هر شماره‌ای | کد در پاسخ `devCode` برمی‌گردد |

### نقشه اندپوینت‌ها (۱۱۱ روت)
- **auth/**: register, login, login/otp/send, login/otp/verify, logout, forgot-password, reset-password, me, me/update, me/avatar, me/change-password
- **catalog**: products(+filters/slug/reviews/questions/similar/price-chart/notify-availability), categories(tree/slug/products/filters/brands), brands
- **commerce**: cart(+items/clear/coupon), orders(+checkout/cancel/return), payments(+create/verify/callback), shipping-methods
- **user**: addresses(+set-default), wishlist, compare, notifications(+read/read-all/unread-count), tickets(+messages/close), wallet(+transactions/deposit)
- **seller**: register, dashboard, products(CRUD-lite), orders, settlements, analytics
- **admin**: dashboard, reports(sales/products/users/revenue), users(+status), products/categories/brands/coupons/offers/banners(reviews moderation/sellers/orders/tickets/payments), settings, logs
- **content**: banners, sliders, menus, pages, blog, faqs, provinces, cities, home
- **search**: /search + suggestions + popular

## رودمپ پرامپت‌های بعدی
1. فرانت: هوم‌پیج کامل روی API (اسلایدر، شگفت‌انگیز با تایمر، ردیف‌های محصول)
2. صفحه محصول: گالری، انتخاب واریانت، نمودار قیمت، دیدگاه‌ها
3. لیست دسته/جستجو با فیلترهای زنده
4. احراز هویت فرانت (ورود با OTP) + پنل کاربری
5. چک‌اوت چندمرحله‌ای + درگاه (sandbox)
6. پنل‌های فروشنده و ادمین (فرانت)
