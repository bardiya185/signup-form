<?php

namespace App\Services;

use App\Support\ApiException;
use App\Support\Dto;
use Illuminate\Support\Facades\DB;

/**
 * پورت کامل cart.service.ts — سبد مهمان/کاربر، کوپن، محاسبات دقیق یکسان.
 */
final class CartService
{
    /** مالک سبد: کاربر لاگین یا session مهمان (هدر x-session-id، پیش‌فرض guest-shared) */
    public static function owner(\Illuminate\Http\Request $request): array
    {
        $user = $request->attributes->get('gnk_user');
        if ($user) {
            return ['userId' => (int) $user->id, 'sessionId' => null];
        }
        $sid = trim((string) $request->header('x-session-id', ''));
        return ['userId' => null, 'sessionId' => $sid !== '' ? $sid : 'guest-shared'];
    }

    public static function findCart(array $owner): ?object
    {
        return Dto::rows('carts')->first(
            fn (object $c) => $owner['userId']
                ? (int) $c->user_id === $owner['userId']
                : $c->session_id === $owner['sessionId'],
        );
    }

    private static function ensureCart(array $owner): object
    {
        $existing = self::findCart($owner);
        if ($existing) {
            return $existing;
        }
        $id = DB::table('carts')->insertGetId([
            'user_id' => $owner['userId'], 'session_id' => $owner['sessionId'],
            'coupon_id' => null, 'created_at' => Dto::now(), 'updated_at' => Dto::now(),
        ]);
        Dto::flush();
        return Dto::find('carts', $id);
    }

    /** @return \Illuminate\Support\Collection<int, object> */
    public static function itemsOf(object $cart): \Illuminate\Support\Collection
    {
        return Dto::rows('cart_items')->where('cart_id', $cart->id)->values();
    }

    private static function variantOr404(int $variantId): object
    {
        $variant = Dto::rows('product_variants')->first(fn (object $v) => (int) $v->id === $variantId && (bool) $v->is_active);
        if (!$variant) {
            throw ApiException::notFound('تنوع محصول مورد نظر یافت نشد');
        }
        if ((int) $variant->stock <= 0) {
            throw ApiException::unprocessable(['product_variant_id' => ['این کالا در حال حاضر موجود نیست']]);
        }
        return $variant;
    }

    private static function guardQuantity(object $variant, int $quantity, int $alreadyInCart = 0): void
    {
        $total = $quantity + $alreadyInCart;
        if ($total > (int) $variant->stock) {
            throw ApiException::unprocessable(['quantity' => ["حداکثر موجودی این کالا {$variant->stock} عدد است"]]);
        }
        if ($total > (int) $variant->max_per_order) {
            throw ApiException::unprocessable(['quantity' => ["حداکثر تعداد قابل سفارش این کالا {$variant->max_per_order} عدد است"]]);
        }
    }

    // ─── کوپن ───
    public static function computeCouponDiscount(object $coupon, \Illuminate\Support\Collection $items): int
    {
        $eligible = $items;
        $applicableProducts = $coupon->applicable_products ? Dto::js($coupon->applicable_products) : [];
        if (!empty($applicableProducts)) {
            $eligible = $eligible->filter(function (object $i) use ($applicableProducts) {
                $variant = Dto::find('product_variants', (int) $i->product_variant_id);
                return $variant && in_array((int) $variant->product_id, $applicableProducts, true);
            })->values();
        }
        $applicableCategories = $coupon->applicable_categories ? Dto::js($coupon->applicable_categories) : [];
        if (!empty($applicableCategories)) {
            $eligible = $eligible->filter(function (object $i) use ($applicableCategories) {
                $variant = Dto::find('product_variants', (int) $i->product_variant_id);
                $product = $variant ? Dto::find('products', (int) $variant->product_id) : null;
                return $product && in_array((int) $product->category_id, $applicableCategories, true);
            })->values();
        }
        $eligibleSubtotal = $eligible->reduce(function (int $sum, object $i) {
            $variant = Dto::find('product_variants', (int) $i->product_variant_id);
            return $sum + ($variant ? Dto::effectivePriceOf($variant) * (int) $i->quantity : 0);
        }, 0);
        if ($eligibleSubtotal <= 0) {
            return 0;
        }
        if ($coupon->type === 'percentage') {
            $raw = intdiv($eligibleSubtotal * (int) $coupon->value, 100);
            return $coupon->max_discount !== null ? min($raw, (int) $coupon->max_discount) : $raw;
        }
        return min((int) $coupon->value, $eligibleSubtotal);
    }

    private static function assertCouponUsable(object $coupon, array $owner, int $subtotal): void
    {
        if (!(bool) $coupon->is_active) {
            throw ApiException::unprocessable(['code' => ['این کد تخفیف غیرفعال است']]);
        }
        $n = time();
        if ($coupon->starts_at && strtotime((string) $coupon->starts_at) > $n) {
            throw ApiException::unprocessable(['code' => ['این کد تخفیف هنوز فعال نشده است']]);
        }
        if ($coupon->expires_at && strtotime((string) $coupon->expires_at) < $n) {
            throw ApiException::unprocessable(['code' => ['مهلت استفاده از این کد تخفیف به پایان رسیده است']]);
        }
        if ($coupon->usage_limit !== null && (int) $coupon->used_count >= (int) $coupon->usage_limit) {
            throw ApiException::unprocessable(['code' => ['ظرفیت استفاده از این کد تخفیف تکمیل شده است']]);
        }
        if ($coupon->min_order_amount !== null && $subtotal < (int) $coupon->min_order_amount) {
            throw ApiException::unprocessable(['code' => ['حداقل مبلغ سفارش برای این کد ' . Dto::faNum((int) $coupon->min_order_amount) . ' تومان است']]);
        }
        if ($owner['userId']) {
            $usedByUser = Dto::rows('orders')->where('user_id', $owner['userId'])->where('coupon_id', $coupon->id)->count();
            if ($usedByUser >= (int) $coupon->per_user_limit) {
                throw ApiException::unprocessable(['code' => ['شما قبلاً از این کد تخفیف استفاده کرده‌اید']]);
            }
        }
    }

    // ─── خروجی سبد ───
    public static function buildCartDto(?object $cart): array
    {
        $threshold = (int) (Dto::setting('free_shipping_threshold', '2000000'));
        if (!$cart) {
            return [
                'id' => null, 'items' => [],
                'totals' => [
                    'itemsCount' => 0, 'subtotal' => 0, 'discount' => 0, 'couponDiscount' => 0, 'couponCode' => null,
                    'shippingCost' => null, 'total' => 0, 'freeShippingThreshold' => $threshold, 'remainingForFreeShipping' => $threshold,
                ],
            ];
        }

        $rows = self::itemsOf($cart);
        $items = [];
        foreach ($rows as $row) {
            $variant = Dto::find('product_variants', (int) $row->product_variant_id);
            if (!$variant) continue;
            $product = Dto::find('products', (int) $variant->product_id);
            if (!$product) continue;
            $img = Dto::rows('product_images')->where('product_id', $product->id)->where('is_primary', 1)->first()
                ?? Dto::rows('product_images')->where('product_id', $product->id)->first();
            $unitPrice = Dto::effectivePriceOf($variant);
            $items[] = [
                'id' => $row->id,
                'product' => ['id' => $product->id, 'slug' => $product->slug, 'title' => $product->title, 'image' => $img->image_path ?? ''],
                'variant' => Dto::variantDto($variant),
                'quantity' => (int) $row->quantity,
                'unitPrice' => $unitPrice,
                'totalPrice' => $unitPrice * (int) $row->quantity,
            ];
        }

        $subtotal = array_sum(array_column($items, 'totalPrice'));
        $coupon = $cart->coupon_id ? Dto::find('coupons', (int) $cart->coupon_id) : null;
        $couponDiscount = $coupon ? self::computeCouponDiscount($coupon, $rows) : 0;
        $total = max(0, $subtotal - $couponDiscount);
        $discount = 0;
        foreach ($items as $i) {
            $discount += ((int) $i['variant']['price'] - (int) $i['unitPrice']) * (int) $i['quantity'];
        }

        return [
            'id' => $cart->id,
            'items' => $items,
            'totals' => [
                'itemsCount' => array_sum(array_column($items, 'quantity')),
                'subtotal' => $subtotal,
                'discount' => $discount,
                'couponDiscount' => $couponDiscount,
                'couponCode' => $coupon?->code,
                'shippingCost' => null,
                'total' => $total,
                'freeShippingThreshold' => $threshold,
                'remainingForFreeShipping' => max(0, $threshold - $subtotal),
            ],
        ];
    }

    // ─── عملیات ───
    public static function getCart(\Illuminate\Http\Request $request): array
    {
        return self::buildCartDto(self::findCart(self::owner($request)));
    }

    public static function addItem(\Illuminate\Http\Request $request, int $variantId, int $quantity): array
    {
        $variant = self::variantOr404($variantId);
        $owner = self::owner($request);
        $cart = self::ensureCart($owner);
        $existing = Dto::rows('cart_items')->first(fn (object $i) => (int) $i->cart_id === (int) $cart->id && (int) $i->product_variant_id === (int) $variant->id);
        self::guardQuantity($variant, $quantity, $existing ? (int) $existing->quantity : 0);
        if ($existing) {
            DB::table('cart_items')->where('id', $existing->id)->update([
                'quantity' => (int) $existing->quantity + $quantity, 'updated_at' => Dto::now(),
            ]);
        } else {
            DB::table('cart_items')->insert([
                'cart_id' => $cart->id, 'product_variant_id' => $variant->id, 'quantity' => $quantity,
                'created_at' => Dto::now(), 'updated_at' => Dto::now(),
            ]);
        }
        Dto::flush();
        return self::buildCartDto(Dto::find('carts', (int) $cart->id));
    }

    public static function updateItem(\Illuminate\Http\Request $request, int $itemId, int $quantity): array
    {
        $cart = self::findCart(self::owner($request));
        $item = $cart ? Dto::rows('cart_items')->first(fn (object $i) => (int) $i->id === $itemId && (int) $i->cart_id === (int) $cart->id) : null;
        if (!$cart || !$item) {
            throw ApiException::notFound('آیتم مورد نظر در سبد خرید یافت نشد');
        }
        if ($quantity <= 0) {
            DB::table('cart_items')->where('id', $itemId)->delete();
            Dto::flush();
            return self::buildCartDto(Dto::find('carts', (int) $cart->id));
        }
        $variant = self::variantOr404((int) $item->product_variant_id);
        self::guardQuantity($variant, $quantity);
        DB::table('cart_items')->where('id', $itemId)->update(['quantity' => $quantity, 'updated_at' => Dto::now()]);
        Dto::flush();
        return self::buildCartDto(Dto::find('carts', (int) $cart->id));
    }

    public static function removeItem(\Illuminate\Http\Request $request, int $itemId): array
    {
        $cart = self::findCart(self::owner($request));
        if (!$cart) {
            throw ApiException::notFound('سبد خرید یافت نشد');
        }
        $exists = Dto::rows('cart_items')->contains(fn (object $i) => (int) $i->id === $itemId && (int) $i->cart_id === (int) $cart->id);
        if (!$exists) {
            throw ApiException::notFound('آیتم مورد نظر در سبد خرید یافت نشد');
        }
        DB::table('cart_items')->where('id', $itemId)->delete();
        Dto::flush();
        return self::buildCartDto(Dto::find('carts', (int) $cart->id));
    }

    public static function clearCart(\Illuminate\Http\Request $request): array
    {
        $cart = self::findCart(self::owner($request));
        if ($cart) {
            DB::table('cart_items')->where('cart_id', $cart->id)->delete();
            DB::table('carts')->where('id', $cart->id)->update(['coupon_id' => null]);
            Dto::flush();
        }
        return self::buildCartDto($cart ? Dto::find('carts', (int) $cart->id) : null);
    }

    public static function applyCoupon(\Illuminate\Http\Request $request, string $code): array
    {
        $owner = self::owner($request);
        $cart = self::findCart($owner);
        if (!$cart || self::itemsOf($cart)->isEmpty()) {
            throw ApiException::unprocessable(['code' => ['سبد خرید شما خالی است']]);
        }
        $coupon = Dto::rows('coupons')->first(fn (object $c) => mb_strtolower((string) $c->code) === mb_strtolower(trim($code)));
        if (!$coupon) {
            throw ApiException::unprocessable(['code' => ['کد تخفیف معتبر نیست']]);
        }
        $subtotal = self::buildCartDto($cart)['totals']['subtotal'];
        self::assertCouponUsable($coupon, $owner, $subtotal);
        if (self::computeCouponDiscount($coupon, self::itemsOf($cart)) <= 0) {
            throw ApiException::unprocessable(['code' => ['این کد تخفیف برای اقلام سبد شما قابل استفاده نیست']]);
        }
        DB::table('carts')->where('id', $cart->id)->update(['coupon_id' => $coupon->id]);
        Dto::flush();
        return self::buildCartDto(Dto::find('carts', (int) $cart->id));
    }

    public static function removeCoupon(\Illuminate\Http\Request $request): array
    {
        $cart = self::findCart(self::owner($request));
        if ($cart) {
            DB::table('carts')->where('id', $cart->id)->update(['coupon_id' => null]);
            Dto::flush();
        }
        return self::buildCartDto($cart ? Dto::find('carts', (int) $cart->id) : null);
    }
}
