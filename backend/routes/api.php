<?php

/**
 * مسیرهای API گینان‌کالا — پیشوند /api/v1
 * قرارداد پاسخ: { "data": ... } | { "data": [...], "meta": {...} }
 * خطاها: 422 { message, errors } فارسی | 401 | 403 | 404
 * احراز: Bearer token (جدول personal_access_tokens)
 *
 * فاز ۳: فروشگاه و حساب کاربری (فاز ۴: پنل‌های admin/seller/warehouse)
 */
use App\Http\Controllers\Api\V1\AddressController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CartController;
use App\Http\Controllers\Api\V1\CatalogController;
use App\Http\Controllers\Api\V1\ContentController;
use App\Http\Controllers\Api\V1\EngagementController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\SearchController;
use App\Http\Controllers\Api\V1\TicketController;
use App\Http\Controllers\Api\V1\WalletController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::get('/health', fn () => response()->json([
        'data' => ['status' => 'ok', 'backend' => 'laravel', 'version' => '12.x', 'time' => now()->toIso8601String()],
    ]));

    // ─── احراز (عمومی) ───
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/login/otp/send', [AuthController::class, 'sendOtp']);
    Route::post('/auth/login/otp/verify', [AuthController::class, 'verifyOtp']);
    Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

    // ─── حساب کاربری (توکن لازم) ───
    Route::middleware('auth.token')->group(function (): void {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::put('/auth/me/update', [AuthController::class, 'update']);
        Route::post('/auth/me/avatar', [AuthController::class, 'avatar']);
        Route::put('/auth/me/change-password', [AuthController::class, 'changePassword']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        Route::get('/addresses', [AddressController::class, 'index']);
        Route::post('/addresses', [AddressController::class, 'store']);
        Route::put('/addresses/{id}', [AddressController::class, 'update']);
        Route::delete('/addresses/{id}', [AddressController::class, 'destroy']);
        Route::put('/addresses/{id}/set-default', [AddressController::class, 'setDefault']);

        Route::post('/orders/checkout', [OrderController::class, 'checkout']);
        Route::get('/orders', [OrderController::class, 'index']);
        Route::get('/orders/{orderNumber}', [OrderController::class, 'show']);
        Route::post('/orders/{orderNumber}/cancel', [OrderController::class, 'cancel']);
        Route::post('/orders/{orderNumber}/return', [OrderController::class, 'returnOrder']);

        Route::get('/wallet', [WalletController::class, 'show']);
        Route::get('/wallet/transactions', [WalletController::class, 'transactions']);
        Route::post('/wallet/deposit', [WalletController::class, 'deposit']);

        Route::get('/payments', [PaymentController::class, 'index']);
        Route::post('/payments/create', [PaymentController::class, 'create']);

        Route::get('/wishlist', [EngagementController::class, 'wishlist']);
        Route::post('/wishlist/{productId}', [EngagementController::class, 'wishlistAdd']);
        Route::delete('/wishlist/{productId}', [EngagementController::class, 'wishlistRemove']);

        Route::get('/notifications', [EngagementController::class, 'notifications']);
        Route::get('/notifications/unread-count', [EngagementController::class, 'unreadCount']);
        Route::put('/notifications/read-all', [EngagementController::class, 'readAll']);
        Route::put('/notifications/{id}/read', [EngagementController::class, 'read']);

        Route::get('/tickets', [TicketController::class, 'index']);
        Route::post('/tickets', [TicketController::class, 'store']);
        Route::get('/tickets/{id}', [TicketController::class, 'show']);
        Route::put('/tickets/{id}/close', [TicketController::class, 'close']);
        Route::post('/tickets/{id}/messages', [TicketController::class, 'addMessage']);

        Route::post('/products/{slug}/reviews', [CatalogController::class, 'storeReview']);
        Route::post('/products/{slug}/questions', [CatalogController::class, 'storeQuestion']);
    });

    // ─── سبد و مقایسه (توکن اختیاری — مهمان هم دارد) ───
    Route::middleware('auth.optional')->group(function (): void {
        Route::get('/cart', [CartController::class, 'show']);
        Route::post('/cart/items', [CartController::class, 'store']);
        Route::put('/cart/items/{itemId}', [CartController::class, 'update']);
        Route::delete('/cart/items/{itemId}', [CartController::class, 'destroy']);
        Route::post('/cart/clear', [CartController::class, 'clear']);
        Route::post('/cart/coupon/apply', [CartController::class, 'applyCoupon']);
        Route::delete('/cart/coupon/remove', [CartController::class, 'removeCoupon']);

        Route::get('/compare', [EngagementController::class, 'compareGet']);
        Route::post('/compare/{productId}', [EngagementController::class, 'compareAdd']);
        Route::delete('/compare/{productId}', [EngagementController::class, 'compareRemove']);

        Route::post('/products/{slug}/notify-availability', [CatalogController::class, 'notifyAvailability']);
    });

    // ─── کاتالوگ و جستجو (عمومی) ───
    Route::get('/home', [CatalogController::class, 'home']);
    Route::get('/categories', [CatalogController::class, 'categories']);
    Route::get('/categories/{slug}', [CatalogController::class, 'category']);
    Route::get('/categories/{slug}/products', [CatalogController::class, 'categoryProducts']);
    Route::get('/categories/{slug}/filters', [CatalogController::class, 'categoryFilters']);
    Route::get('/categories/{slug}/brands', [CatalogController::class, 'categoryBrands']);
    Route::get('/brands', [CatalogController::class, 'brands']);
    Route::get('/products', [CatalogController::class, 'products']);
    Route::get('/products/{slug}', [CatalogController::class, 'product']);
    Route::get('/products/{slug}/similar', [CatalogController::class, 'similar']);
    Route::get('/products/{slug}/price-chart', [CatalogController::class, 'priceChart']);
    Route::get('/products/{slug}/reviews', [CatalogController::class, 'reviews']);
    Route::get('/products/{slug}/questions', [CatalogController::class, 'questions']);
    Route::get('/offers/incredible', [CatalogController::class, 'offers']);
    Route::get('/search', [SearchController::class, 'search']);
    Route::get('/search/suggest', [SearchController::class, 'suggest']);
    Route::get('/search/suggestions', [SearchController::class, 'suggest']);
    Route::get('/search/popular', [SearchController::class, 'popular']);

    // ─── محتوا (عمومی) ───
    Route::get('/banners', [ContentController::class, 'banners']);
    Route::get('/sliders', [ContentController::class, 'sliders']);
    Route::get('/menus', [ContentController::class, 'menus']);
    Route::get('/faqs', [ContentController::class, 'faqs']);
    Route::get('/pages/{slug}', [ContentController::class, 'page']);
    Route::get('/blog', [ContentController::class, 'blog']);
    Route::get('/blog/{slug}', [ContentController::class, 'blogShow']);
    Route::get('/provinces', [ContentController::class, 'provinces']);
    Route::get('/provinces/{provinceId}/cities', [ContentController::class, 'cities']);
    Route::get('/shipping-methods', [ContentController::class, 'shippingMethods']);

    // ─── درگاه سندباکس ───
    Route::get('/payments/verify', [PaymentController::class, 'verify']);
    Route::get('/payments/callback/{gateway}', [PaymentController::class, 'callback']);
});
