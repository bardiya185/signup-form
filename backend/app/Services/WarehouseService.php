<?php

namespace App\Services;

use App\Support\ApiException;
use App\Support\Dto;
use Illuminate\Support\Facades\DB;

/**
 * سرویس انبار — پورت یک‌به‌یک warehouse.service.ts
 * داشبورد، موجودی، تعدیل استوک با لاگ گردش، صف ارسال و خروج از انبار.
 */
class WarehouseService
{
    /** ردیف نمایشی تنوع برای انبار — null اگر محصول حذف شده باشد */
    private static function variantRow(object $v): ?array
    {
        $product = Dto::rows('products')->first(
            fn (object $p) => (int) $p->id === (int) $v->product_id && $p->deleted_at === null
        );
        if (!$product) {
            return null;
        }
        $image = Dto::rows('product_images')->first(
            fn (object $i) => (int) $i->product_id === (int) $product->id && (int) $i->is_primary === 1
        );
        $stock = (int) $v->stock;
        return [
            'variantId' => (int) $v->id,
            'sku' => $v->sku,
            'productId' => (int) $product->id,
            'productTitle' => $product->title,
            'productSlug' => $product->slug,
            'image' => $image?->image_path,
            'color' => $v->color_id !== null && ($color = Dto::find('colors', (int) $v->color_id)) ? (array) $color : null,
            'guarantee' => $v->guarantee_id !== null ? (Dto::find('guarantees', (int) $v->guarantee_id)?->title ?? null) : null,
            'price' => (int) $v->price,
            'salePrice' => $v->sale_price !== null ? (int) $v->sale_price : null,
            'stock' => $stock,
            'isActive' => (bool) $v->is_active,
            'status' => $stock <= 0 ? 'out_of_stock' : ($stock <= 3 ? 'low_stock' : 'in_stock'),
        ];
    }

    /** @return array<int, array> */
    private static function allVariantRows(): array
    {
        return Dto::rows('product_variants')
            ->filter(fn (object $v) => (int) $v->is_active === 1)
            ->map(fn (object $v) => self::variantRow($v))
            ->filter()
            ->values()->all();
    }

    // ─── داشبورد انبار ───
    public static function warehouseDashboard(): array
    {
        $rows = self::allVariantRows();
        $today = gmdate('Y-m-d');
        $weeklyAgo = gmdate('Y-m-d\TH:i:s\Z', time() - 7 * 86400);
        $toShip = Dto::rows('orders')->where('status', 'processing');
        $shippedThisWeek = Dto::rows('orders')->filter(
            fn (object $o) => $o->status === 'shipped' && (string) ($o->shipped_at ?? '') >= $weeklyAgo
        );

        $readyShipments = Dto::rows('orders')
            ->where('status', 'processing')
            ->sortBy('created_at')
            ->take(6)
            ->map(fn (object $o) => [
                'id' => (int) $o->id,
                'orderNumber' => $o->order_number,
                'buyer' => Dto::userNameOf((int) $o->user_id),
                'itemsCount' => Dto::rows('order_items')->where('order_id', $o->id)->sum(fn (object $i) => (int) $i->quantity),
                'total' => (int) $o->total_amount,
                'createdAt' => $o->created_at,
            ])->values()->all();

        $lowStock = collect($rows)
            ->filter(fn (array $r) => $r['status'] !== 'in_stock')
            ->sortBy('stock')
            ->take(10)->values()->all();

        return [
            'stats' => [
                'totalVariants' => count($rows),
                'totalStockUnits' => array_sum(array_column($rows, 'stock')),
                'stockValue' => array_sum(array_map(fn (array $r) => $r['stock'] * ($r['salePrice'] ?? $r['price']), $rows)),
                'lowStockCount' => count(array_filter($rows, fn (array $r) => $r['status'] === 'low_stock')),
                'outOfStockCount' => count(array_filter($rows, fn (array $r) => $r['status'] === 'out_of_stock')),
                'pendingShipments' => $toShip->count(),
                'shippedThisWeek' => $shippedThisWeek->count(),
                'movementsToday' => Dto::rows('stock_movements')->filter(
                    fn (object $m) => str_starts_with((string) $m->created_at, $today)
                )->count(),
            ],
            'lowStock' => $lowStock,
            'readyShipments' => $readyShipments,
            'recentMovements' => self::movementRows(8),
        ];
    }

    // ─── لیست موجودی ───
    public static function inventoryList(array $filters): array
    {
        $rows = collect(self::allVariantRows());
        if (!empty($filters['q'])) {
            $q = trim($filters['q']);
            $rows = $rows->filter(fn (array $r) => str_contains($r['productTitle'], $q)
                || str_contains(mb_strtolower($r['sku']), mb_strtolower($q)));
        }
        if (!empty($filters['state']) && $filters['state'] !== 'all') {
            $rows = $rows->filter(fn (array $r) => $r['status'] === $filters['state']);
        }
        $rows = $rows->sort(fn (array $a, array $b) => $a['stock'] <=> $b['stock'] ?: $b['variantId'] <=> $a['variantId'])->values();
        $page = $filters['page'];
        $perPage = $filters['perPage'];
        return ['items' => $rows->slice(($page - 1) * $perPage, $perPage)->values()->all(), 'total' => $rows->count()];
    }

    // ─── تعدیل موجودی با لاگ گردش ───
    public static function adjustStock(object $user, int $variantId, int $newStock, ?string $reason = null): array
    {
        $variant = Dto::find('product_variants', $variantId);
        if (!$variant || (int) $variant->is_active !== 1) {
            throw ApiException::notFound('تنوع محصول یافت نشد');
        }
        if ($newStock < 0 || $newStock > 1_000_000) {
            throw ApiException::unprocessable(['stock' => ['مقدار موجودی باید عدد صحیح بین ۰ تا ۱,۰۰۰,۰۰۰ باشد']]);
        }
        $oldStock = (int) $variant->stock;
        if ($oldStock === $newStock) {
            throw ApiException::unprocessable(['stock' => ['موجودی جدید با مقدار فعلی برابر است']]);
        }

        DB::table('product_variants')->where('id', $variantId)->update([
            'stock' => $newStock,
            'updated_at' => Dto::now(),
        ]);
        $product = Dto::find('products', (int) $variant->product_id);
        $cleanReason = ($reason !== null && trim($reason) !== '')
            ? trim($reason)
            : ($newStock > $oldStock ? 'ورود کالا به انبار' : 'خروج کالا از انبار');
        DB::table('stock_movements')->insert([
            'id' => (int) DB::table('stock_movements')->max('id') + 1,
            'product_variant_id' => $variantId,
            'old_stock' => $oldStock,
            'new_stock' => $newStock,
            'delta' => $newStock - $oldStock,
            'reason' => $cleanReason,
            'changed_by' => $user->id,
            'created_at' => Dto::now(),
        ]);
        Dto::logActivity(
            $user->id, 'warehouse.stock_adjust', 'ProductVariant', $variantId,
            'موجودی «' . ($product?->title ?? $variant->sku) . "» از {$oldStock} به {$newStock} تغییر یافت"
        );

        // اطلاع به مشترکین «موجود شد خبرم کن»
        if ($oldStock === 0 && $newStock > 0) {
            foreach (Dto::rows('stock_alerts')->where('product_variant_id', $variantId) as $alert) {
                if ($alert->user_id !== null) {
                    Dto::notify(
                        (int) $alert->user_id, 'back_in_stock',
                        'کالای موردنظر شما موجود شد 🎉',
                        '«' . ($product?->title ?? 'کالا') . '» دوباره در انبار موجود است؛ قبل از اتمام خرید کنید.',
                        ['product_slug' => $product?->slug]
                    );
                }
            }
            DB::table('stock_alerts')->where('product_variant_id', $variantId)->delete();
        }

        Dto::flush();
        return self::variantRow(Dto::find('product_variants', $variantId));
    }

    // ─── سفارش‌های آماده ارسال / ارسال‌شده ───
    public static function shipmentsList(string $state, int $page, int $perPage): array
    {
        $status = $state === 'ready' ? 'processing' : 'shipped';
        $list = Dto::rows('orders')->where('status', $status);
        $list = ($state === 'ready')
            ? $list->sortBy('created_at')
            : $list->sortByDesc(fn (object $o) => $o->shipped_at ?? $o->updated_at);
        $rows = $list->map(function (object $o) {
            $address = $o->address_id !== null ? Dto::find('addresses', (int) $o->address_id) : null;
            $destination = '—';
            if ($address) {
                $province = Dto::find('provinces', (int) $address->province_id)?->name ?? '';
                $city = Dto::find('cities', (int) $address->city_id)?->name ?? '';
                $destination = "{$province}، {$city}";
            }
            return [
                'id' => (int) $o->id,
                'orderNumber' => $o->order_number,
                'status' => $o->status,
                'statusFa' => Dto::ORDER_STATUS_FA[$o->status] ?? $o->status,
                'buyer' => Dto::userNameOf((int) $o->user_id),
                'destination' => $destination,
                'itemsCount' => Dto::rows('order_items')->where('order_id', $o->id)->sum(fn (object $i) => (int) $i->quantity),
                'items' => Dto::rows('order_items')->where('order_id', $o->id)->map(fn (object $i) => [
                    'id' => (int) $i->id,
                    'title' => $i->product_title,
                    'variantInfo' => Dto::js($i->variant_info),
                    'quantity' => (int) $i->quantity,
                ])->values()->all(),
                'total' => (int) $o->total_amount,
                'createdAt' => $o->created_at,
                'shippedAt' => $o->shipped_at,
            ];
        })->values();
        return ['items' => $rows->slice(($page - 1) * $perPage, $perPage)->values()->all(), 'total' => $rows->count()];
    }

    /** خروج سفارش از انبار: processing → shipped */
    public static function shipOrder(object $user, int $orderId): array
    {
        $order = Dto::find('orders', $orderId);
        if (!$order) {
            throw ApiException::notFound('سفارش یافت نشد');
        }
        if ($order->status !== 'processing') {
            throw ApiException::unprocessable(['status' => ['فقط سفارش‌های «در حال پردازش» قابل خروج از انبار هستند']]);
        }
        DB::table('orders')->where('id', $orderId)->update([
            'status' => 'shipped',
            'shipped_at' => Dto::now(),
            'updated_at' => Dto::now(),
        ]);
        $shippedOrder = (object) array_merge((array) $order, ['status' => 'shipped']);
        OrderService::pushHistory($shippedOrder, 'processing', 'سفارش از انبار خارج و به واحد ارسال تحویل داده شد', $user->id);
        Dto::notify(
            (int) $order->user_id, 'order_status', 'سفارش شما ارسال شد 📦',
            "سفارش {$order->order_number} از انبار گینان‌کالا خارج شد و به‌زودی به دستتان می‌رسد.",
            ['order_id' => (int) $order->id, 'order_number' => $order->order_number]
        );
        Dto::flush();
        Dto::logActivity($user->id, 'warehouse.ship_order', 'Order', $orderId, "خروج سفارش {$order->order_number} از انبار");
        $fresh = Dto::find('orders', $orderId);
        return [
            'id' => (int) $fresh->id,
            'orderNumber' => $fresh->order_number,
            'status' => $fresh->status,
            'statusFa' => Dto::ORDER_STATUS_FA[$fresh->status] ?? $fresh->status,
            'shippedAt' => $fresh->shipped_at,
        ];
    }

    // ─── گزارش گردش موجودی ───
    private static function movementRow(object $m): array
    {
        $variant = Dto::find('product_variants', (int) $m->product_variant_id);
        $product = $variant ? Dto::find('products', (int) $variant->product_id) : null;
        return [
            'id' => (int) $m->id,
            'sku' => $variant?->sku ?? '—',
            'productTitle' => $product?->title ?? '—',
            'oldStock' => (int) $m->old_stock,
            'newStock' => (int) $m->new_stock,
            'delta' => (int) $m->delta,
            'reason' => $m->reason,
            'changedBy' => $m->changed_by !== null ? Dto::userNameOf((int) $m->changed_by) : 'سیستم',
            'createdAt' => $m->created_at,
        ];
    }

    /** @return array<int, array> */
    private static function movementRows(int $limit): array
    {
        return Dto::rows('stock_movements')
            ->sortByDesc('id')
            ->take($limit)
            ->map(fn (object $m) => self::movementRow($m))
            ->values()->all();
    }

    public static function movementLog(int $page, int $perPage): array
    {
        $all = Dto::rows('stock_movements')->sortByDesc('id')->values();
        return [
            'items' => $all->slice(($page - 1) * $perPage, $perPage)->map(fn (object $m) => self::movementRow($m))->values()->all(),
            'total' => $all->count(),
        ];
    }
}
