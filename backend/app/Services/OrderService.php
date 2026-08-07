<?php

namespace App\Services;

use App\Support\ApiException;
use App\Support\DemoHash;
use App\Support\Dto;
use Illuminate\Support\Facades\DB;

/**
 * پورت کامل order.service.ts — تسویه، پرداخت کیف‌پول، لغو/مرجوع، تاریخچه وضعیت.
 */
final class OrderService
{
    private static function nextOrderNumber(): string
    {
        $max = 100200;
        foreach (Dto::rows('orders') as $o) {
            $n = (int) preg_replace('/\D/', '', (string) $o->order_number);
            if ($n > $max) $max = $n;
        }
        return 'GNK-' . ($max + 1);
    }

    public static function pushHistory(object $order, ?string $oldStatus, string $description, ?int $changedBy = null): void
    {
        DB::table('order_status_history')->insert([
            'order_id' => $order->id, 'old_status' => $oldStatus, 'new_status' => $order->status,
            'description' => $description, 'changed_by' => $changedBy,
            'created_at' => Dto::now(), 'updated_at' => Dto::now(),
        ]);
    }

    public static function findOrderByKey(string $key): ?object
    {
        return Dto::rows('orders')->first(
            fn (object $o) => $o->order_number === $key || (ctype_digit($key) && (int) $o->id === (int) $key),
        );
    }

    private static function refundToWallet(object $order, string $reasonText): void
    {
        if ($order->payment_status !== 'paid') return;
        $wallet = Dto::rows('wallets')->firstWhere('user_id', $order->user_id);
        if (!$wallet) {
            $walletId = DB::table('wallets')->insertGetId([
                'user_id' => $order->user_id, 'balance' => 0, 'created_at' => Dto::now(), 'updated_at' => Dto::now(),
            ]);
            Dto::flush();
            $wallet = Dto::find('wallets', $walletId);
        }
        DB::table('wallets')->where('id', $wallet->id)->update(['balance' => (int) $wallet->balance + (int) $order->total_amount, 'updated_at' => Dto::now()]);
        DB::table('wallet_transactions')->insert([
            'wallet_id' => $wallet->id, 'type' => 'deposit', 'amount' => $order->total_amount,
            'description' => $reasonText, 'reference_id' => $order->order_number,
            'created_at' => Dto::now(), 'updated_at' => Dto::now(),
        ]);
        DB::table('orders')->where('id', $order->id)->update(['payment_status' => 'refunded']);
        DB::table('payments')->where('order_id', $order->id)->where('status', 'success')->update(['status' => 'refunded']);
        Dto::flush();
        $order->payment_status = 'refunded';
    }

    // ─── تسویه حساب ───
    public static function checkout(object $user, array $input): array
    {
        $cart = Dto::rows('carts')->firstWhere('user_id', $user->id);
        $items = $cart ? Dto::rows('cart_items')->where('cart_id', $cart->id)->values() : collect();
        if (!$cart || $items->isEmpty()) {
            throw ApiException::unprocessable(['cart' => ['سبد خرید شما خالی است']]);
        }

        $address = Dto::rows('addresses')->first(fn (object $a) => (int) $a->id === (int) $input['address_id'] && (int) $a->user_id === (int) $user->id);
        if (!$address) {
            throw ApiException::unprocessable(['address_id' => ['آدرس انتخاب شده معتبر نیست']]);
        }

        $methodId = $input['shipping_method_id'] ?? (int) Dto::setting('default_shipping_method_id', '1');
        $method = Dto::rows('shipping_methods')->first(fn (object $m) => (int) $m->id === (int) $methodId && (bool) $m->is_active);
        if (!$method) {
            throw ApiException::unprocessable(['shipping_method_id' => ['روش ارسال معتبر نیست']]);
        }

        // بررسی مجدد موجودی — معادل تراکنش لاراول
        return DB::transaction(function () use ($user, $input, $cart, $items, $address, $method) {
            Dto::flush();
            $lines = [];
            foreach ($items as $item) {
                $variant = Dto::rows('product_variants')->first(fn (object $v) => (int) $v->id === (int) $item->product_variant_id && (bool) $v->is_active);
                if (!$variant) {
                    throw ApiException::unprocessable(['cart' => ['یکی از اقلام سبد دیگر موجود نیست']]);
                }
                if ((int) $variant->stock < (int) $item->quantity) {
                    $product = Dto::find('products', (int) $variant->product_id);
                    throw ApiException::unprocessable(['cart' => ['موجودی «' . ($product?->title ?? 'کالا') . '» کافی نیست']]);
                }
                $lines[] = ['variant' => $variant, 'quantity' => (int) $item->quantity, 'unitPrice' => Dto::effectivePriceOf($variant)];
            }

            $subtotal = array_sum(array_map(fn (array $l) => $l['unitPrice'] * $l['quantity'], $lines));
            $threshold = (int) Dto::setting('free_shipping_threshold', '2000000');
            $shippingCost = $subtotal >= $threshold ? 0 : (int) $method->cost;

            $coupon = $cart->coupon_id ? Dto::find('coupons', (int) $cart->coupon_id) : null;
            $couponDiscount = $coupon ? CartService::computeCouponDiscount($coupon, $items) : 0;
            $total = max(0, $subtotal + $shippingCost - $couponDiscount);

            $orderId = DB::table('orders')->insertGetId([
                'user_id' => $user->id, 'address_id' => $address->id,
                'order_number' => self::nextOrderNumber(),
                'status' => 'pending', 'payment_status' => 'pending', 'payment_method' => $input['payment_method'],
                'subtotal' => $subtotal, 'shipping_cost' => $shippingCost, 'tax_amount' => 0,
                'discount_amount' => $couponDiscount, 'total_amount' => $total,
                'coupon_id' => $coupon?->id, 'coupon_discount' => $couponDiscount,
                'notes' => $input['notes'] ?? null,
                'shipped_at' => null, 'delivered_at' => null, 'cancelled_at' => null, 'cancellation_reason' => null,
                'created_at' => Dto::now(), 'updated_at' => Dto::now(), 'deleted_at' => null,
            ]);

            foreach ($lines as $line) {
                $variant = $line['variant'];
                $product = Dto::find('products', (int) $variant->product_id);
                DB::table('order_items')->insert([
                    'order_id' => $orderId, 'product_variant_id' => $variant->id,
                    'product_title' => $product?->title ?? '',
                    'variant_info' => json_encode([
                        'sku' => $variant->sku,
                        'color' => $variant->color_id ? (Dto::find('colors', (int) $variant->color_id)->name ?? null) : null,
                        'size' => $variant->size_id ? (Dto::find('sizes', (int) $variant->size_id)->name ?? null) : null,
                        'guarantee' => $variant->guarantee_id ? (Dto::find('guarantees', (int) $variant->guarantee_id)->title ?? null) : null,
                    ], JSON_UNESCAPED_UNICODE),
                    'quantity' => $line['quantity'], 'unit_price' => $line['unitPrice'],
                    'total_price' => $line['unitPrice'] * $line['quantity'],
                    'created_at' => Dto::now(), 'updated_at' => Dto::now(),
                ]);
                $newStock = max(0, (int) $variant->stock - $line['quantity']);
                DB::table('product_variants')->where('id', $variant->id)->update(['stock' => $newStock, 'updated_at' => Dto::now()]);
            }
            if ($coupon) {
                DB::table('coupons')->where('id', $coupon->id)->update(['used_count' => (int) $coupon->used_count + 1]);
            }

            Dto::flush();
            $order = Dto::find('orders', $orderId);
            self::pushHistory($order, null, 'سفارش ثبت شد');
            DB::table('cart_items')->where('cart_id', $cart->id)->delete();
            DB::table('carts')->where('id', $cart->id)->update(['coupon_id' => null]);
            Dto::flush();

            // رویداد OrderPlaced
            Dto::notify((int) $user->id, 'order_status', 'سفارش شما ثبت شد',
                "سفارش {$order->order_number} با مبلغ " . Dto::faNum((int) $order->total_amount) . ' تومان ثبت شد و در انتظار پرداخت است.',
                ['orderNumber' => $order->order_number]);
            Dto::logActivity((int) $user->id, 'order.placed', 'order', $orderId, "ثبت سفارش {$order->order_number}");

            // پرداخت کیف‌پول → تسویه آنی
            if ($input['payment_method'] === 'wallet') {
                $wallet = Dto::rows('wallets')->firstWhere('user_id', $user->id);
                if (!$wallet || (int) $wallet->balance < $total) {
                    throw new ApiException(422, 'موجودی کیف پول شما برای تکمیل سفارش کافی نیست');
                }
                DB::table('wallets')->where('id', $wallet->id)->update(['balance' => (int) $wallet->balance - $total, 'updated_at' => Dto::now()]);
                DB::table('wallet_transactions')->insert([
                    'wallet_id' => $wallet->id, 'type' => 'withdraw', 'amount' => $total,
                    'description' => "پرداخت سفارش {$order->order_number}", 'reference_id' => $order->order_number,
                    'created_at' => Dto::now(), 'updated_at' => Dto::now(),
                ]);
                DB::table('payments')->insert([
                    'user_id' => $user->id, 'order_id' => $orderId, 'amount' => $total,
                    'method' => 'wallet', 'status' => 'success',
                    'transaction_id' => "W-{$order->order_number}-" . substr(DemoHash::token(), 0, 8),
                    'ref_number' => DemoHash::refNumber(), 'gateway_response' => null,
                    'paid_at' => Dto::now(), 'created_at' => Dto::now(), 'updated_at' => Dto::now(),
                ]);
                Dto::flush();
                self::markOrderPaid(Dto::find('orders', $orderId));
                $payment = Dto::rows('payments')->where('order_id', $orderId)->where('status', 'success')->last();
                // رویداد PaymentVerified
                Dto::notify((int) $user->id, 'order_status', 'پرداخت موفق',
                    "پرداخت سفارش {$order->order_number} با موفقیت انجام شد. کد رهگیری: {$payment->ref_number}",
                    ['orderNumber' => $order->order_number]);
                return [
                    'order' => Dto::orderDetailDto(Dto::find('orders', $orderId)),
                    'payment' => Dto::paymentDto($payment),
                    'requiresRedirect' => false,
                    'payUrl' => null,
                ];
            }

            return [
                'order' => Dto::orderDetailDto(Dto::find('orders', $orderId)),
                'payment' => null,
                'requiresRedirect' => true,
                'payUrl' => null,
            ];
        });
    }

    /** علامت‌گذاری سفارش پرداخت‌شده — توسط PaymentService هم استفاده می‌شود */
    public static function markOrderPaid(object $order): void
    {
        DB::table('orders')->where('id', $order->id)->update([
            'payment_status' => 'paid', 'status' => 'processing', 'updated_at' => Dto::now(),
        ]);
        Dto::flush();
        $fresh = Dto::find('orders', (int) $order->id);
        self::pushHistory($fresh, 'pending', 'پرداخت با موفقیت انجام شد');
        Dto::notify((int) $fresh->user_id, 'order_status', 'به‌روزرسانی سفارش',
            "وضعیت سفارش {$fresh->order_number} به «" . Dto::ORDER_STATUS_FA['processing'] . "» تغییر یافت.",
            ['orderNumber' => $fresh->order_number, 'status' => 'processing']);
    }

    // ─── لیست و جزییات کاربر ───
    public static function listUserOrders(object $user, int $page, int $perPage, ?string $status = null): array
    {
        $list = Dto::rows('orders')->where('user_id', $user->id)->whereNull('deleted_at');
        if ($status) {
            $list = $list->where('status', $status);
        }
        $list = $list->sortByDesc('created_at')->values();
        return [
            'items' => $list->slice(($page - 1) * $perPage, $perPage)->map(fn (object $o) => Dto::orderDetailDto($o))->values()->all(),
            'total' => $list->count(),
        ];
    }

    public static function findUserOrder(object $user, string $key): object
    {
        $order = self::findOrderByKey($key);
        if (!$order || ((int) $order->user_id !== (int) $user->id && !in_array($user->role, ['admin', 'super_admin'], true))) {
            throw ApiException::notFound('سفارش مورد نظر یافت نشد');
        }
        return $order;
    }

    public static function cancelOrder(object $user, string $key, string $reason): array
    {
        $order = self::findUserOrder($user, $key);
        if (!in_array($order->status, ['pending', 'processing'], true)) {
            throw ApiException::unprocessable(['order' => ['این سفارش دیگر قابل لغو نیست']]);
        }
        $oldStatus = (string) $order->status;
        // بازگشت موجودی
        foreach (Dto::rows('order_items')->where('order_id', $order->id) as $item) {
            DB::table('product_variants')->where('id', $item->product_variant_id)->increment('stock', (int) $item->quantity, ['updated_at' => Dto::now()]);
        }
        self::refundToWallet($order, "بازگشت وجه کنسلی سفارش {$order->order_number}");
        DB::table('orders')->where('id', $order->id)->update([
            'status' => 'cancelled', 'cancelled_at' => Dto::now(),
            'cancellation_reason' => $reason, 'updated_at' => Dto::now(),
        ]);
        Dto::flush();
        $fresh = Dto::find('orders', (int) $order->id);
        self::pushHistory($fresh, $oldStatus, "لغو سفارش: {$reason}", (int) $user->id);
        Dto::notify((int) $fresh->user_id, 'order_status', 'به‌روزرسانی سفارش',
            "وضعیت سفارش {$fresh->order_number} به «" . Dto::ORDER_STATUS_FA['cancelled'] . "» تغییر یافت.",
            ['orderNumber' => $fresh->order_number, 'status' => 'cancelled']);
        return Dto::orderDetailDto(Dto::find('orders', (int) $order->id));
    }

    public static function returnOrder(object $user, string $key, string $reason): array
    {
        $order = self::findUserOrder($user, $key);
        if ($order->status !== 'delivered') {
            throw ApiException::unprocessable(['order' => ['فقط سفارش‌های تحویل‌شده قابل مرجوع‌کردن هستند']]);
        }
        self::refundToWallet($order, "بازگشت وجه مرجوعی سفارش {$order->order_number}");
        DB::table('orders')->where('id', $order->id)->update(['status' => 'returned', 'updated_at' => Dto::now()]);
        Dto::flush();
        $fresh = Dto::find('orders', (int) $order->id);
        self::pushHistory($fresh, 'delivered', "درخواست مرجوعی: {$reason}", (int) $user->id);
        Dto::notify((int) $fresh->user_id, 'order_status', 'به‌روزرسانی سفارش',
            "وضعیت سفارش {$fresh->order_number} به «" . Dto::ORDER_STATUS_FA['returned'] . "» تغییر یافت.",
            ['orderNumber' => $fresh->order_number, 'status' => 'returned']);
        return Dto::orderDetailDto(Dto::find('orders', (int) $order->id));
    }
}
