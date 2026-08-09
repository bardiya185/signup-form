<?php

namespace App\Services;

use App\Support\ApiException;
use App\Support\Dto;
use Illuminate\Support\Facades\DB;

/**
 * سرویس پنل ادمین — پورت یک‌به‌یک admin.service.ts
 * داشبورد، گزارش‌ها، تنظیمات و مدیریت کاربران.
 */
class AdminService
{
    private const MONTH_FA = ['دی', 'بهمن', 'اسفند', 'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر'];

    private const SETTINGS_KEYS = [
        'site_name', 'site_description', 'support_phone', 'support_email',
        'free_shipping_threshold', 'default_shipping_method_id', 'return_period_days',
        'incredible_offers_enabled', 'maintenance_mode',
    ];

    private static function paidOrders()
    {
        return Dto::rows('orders')->where('payment_status', 'paid')->values();
    }

    /** @return array<int, array{key:string,label:string}> */
    private static function lastMonths(int $n): array
    {
        $out = [];
        $today = new \DateTimeImmutable('now', new \DateTimeZone('UTC'));
        for ($i = $n - 1; $i >= 0; $i--) {
            $d = $today->modify('first day of this month')->modify("-{$i} months");
            $out[] = ['key' => $d->format('Y-m'), 'label' => self::MONTH_FA[(int) $d->format('n') - 1]];
        }
        return $out;
    }

    // ─── داشبورد ───
    public static function dashboard(): array
    {
        $paid = self::paidOrders();
        $paidRevenue = $paid->sum(fn (object $o) => (int) $o->total_amount);
        $today = gmdate('Y-m-d');

        $byStatus = [];
        foreach (['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'] as $s) {
            $byStatus[$s] = Dto::rows('orders')->where('status', $s)->count();
        }

        $salesChart = array_map(function (array $m) use ($paid) {
            $monthOrders = $paid->filter(fn (object $o) => substr((string) $o->created_at, 0, 7) === $m['key']);
            return array_merge($m, [
                'revenue' => $monthOrders->sum(fn (object $o) => (int) $o->total_amount),
                'orders' => $monthOrders->count(),
            ]);
        }, self::lastMonths(6));

        // پرفروش‌ترین‌ها بر اساس آیتم‌های سفارش‌های پرداخت‌شده
        $soldByVariant = [];
        foreach (Dto::rows('order_items') as $i) {
            $order = Dto::find('orders', (int) $i->order_id);
            if (!$order || $order->payment_status !== 'paid') {
                continue;
            }
            $vid = (int) $i->product_variant_id;
            if (!isset($soldByVariant[$vid])) {
                $soldByVariant[$vid] = ['qty' => 0, 'revenue' => 0];
            }
            $soldByVariant[$vid]['qty'] += (int) $i->quantity;
            $soldByVariant[$vid]['revenue'] += (int) $i->total_price;
        }
        $topProducts = [];
        foreach ($soldByVariant as $variantId => $v) {
            $variant = Dto::find('product_variants', $variantId);
            $product = $variant ? Dto::find('products', (int) $variant->product_id) : null;
            if (!$product) {
                continue;
            }
            $image = Dto::rows('product_images')->first(
                fn (object $img) => (int) $img->product_id === (int) $product->id && (int) $img->is_primary === 1
            );
            $topProducts[] = [
                'productId' => (int) $product->id,
                'title' => $product->title,
                'image' => $image?->image_path,
                'quantity' => $v['qty'],
                'revenue' => $v['revenue'],
            ];
        }
        usort($topProducts, fn ($a, $b) => $b['revenue'] <=> $a['revenue']);
        $topProducts = array_slice($topProducts, 0, 5);

        $lowStock = Dto::rows('product_variants')
            ->filter(fn (object $v) => (int) $v->is_active === 1 && (int) $v->stock <= 3)
            ->map(function (object $v) {
                $product = Dto::find('products', (int) $v->product_id);
                return [
                    'variantId' => (int) $v->id,
                    'sku' => $v->sku,
                    'title' => $product?->title ?? '—',
                    'stock' => (int) $v->stock,
                ];
            })->take(8)->values()->all();

        $recentOrders = Dto::rows('orders')
            ->sortByDesc('created_at')
            ->take(6)
            ->map(fn (object $o) => [
                'id' => (int) $o->id,
                'orderNumber' => $o->order_number,
                'buyer' => Dto::userNameOf((int) $o->user_id),
                'total' => (int) $o->total_amount,
                'status' => $o->status,
                'statusFa' => Dto::ORDER_STATUS_FA[$o->status] ?? $o->status,
                'createdAt' => $o->created_at,
            ])->values()->all();

        $todayOrders = Dto::rows('orders')->filter(fn (object $o) => str_starts_with((string) $o->created_at, $today))->count();
        $todayRevenue = $paid->filter(fn (object $o) => str_starts_with((string) $o->updated_at, $today))
            ->sum(fn (object $o) => (int) $o->total_amount);

        return [
            'cards' => [
                'totalRevenue' => $paidRevenue,
                'totalOrders' => Dto::rows('orders')->count(),
                'todayOrders' => $todayOrders,
                'totalUsers' => Dto::rows('users')->whereNull('deleted_at')->count(),
                'totalProducts' => Dto::rows('products')->whereNull('deleted_at')->count(),
                'totalSellers' => Dto::rows('sellers')->count(),
                'todayRevenue' => $todayRevenue,
                'averageOrderValue' => $paid->count() ? (int) round($paidRevenue / $paid->count()) : 0,
            ],
            'ordersByStatus' => $byStatus,
            'salesChart' => $salesChart,
            'topProducts' => $topProducts,
            'lowStock' => $lowStock,
            'pending' => [
                'products' => Dto::rows('products')->where('status', 'pending_review')->count(),
                'reviews' => Dto::rows('reviews')->where('status', 'pending')->count(),
                'sellers' => Dto::rows('sellers')->where('status', 'pending')->count(),
                'openTickets' => Dto::rows('tickets')->where('status', 'open')->count(),
            ],
            'recentOrders' => $recentOrders,
        ];
    }

    // ─── گزارش فروش (روزانه) ───
    public static function salesReport(int $days = 14): array
    {
        $buckets = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $key = gmdate('Y-m-d', time() - $i * 86400);
            $buckets[$key] = ['date' => $key, 'orders' => 0, 'revenue' => 0];
        }
        foreach (self::paidOrders() as $o) {
            $key = substr((string) $o->created_at, 0, 10);
            if (isset($buckets[$key])) {
                $buckets[$key]['orders'] += 1;
                $buckets[$key]['revenue'] += (int) $o->total_amount;
            }
        }
        $daily = array_values($buckets);
        return [
            'daily' => $daily,
            'totalRevenue' => array_sum(array_column($daily, 'revenue')),
            'totalOrders' => array_sum(array_column($daily, 'orders')),
        ];
    }

    // ─── گزارش محصولات ───
    public static function productsReport(): array
    {
        $rows = [];
        foreach (Dto::rows('products')->whereNull('deleted_at') as $p) {
            $variantIds = Dto::rows('product_variants')->where('product_id', $p->id)->map(fn (object $v) => (int) $v->id)->all();
            $stock = Dto::rows('product_variants')->where('product_id', $p->id)->sum(fn (object $v) => (int) $v->stock);
            $unitsSold = 0;
            $revenue = 0;
            foreach (Dto::rows('order_items') as $i) {
                if (!in_array((int) $i->product_variant_id, $variantIds, true)) {
                    continue;
                }
                $order = Dto::find('orders', (int) $i->order_id);
                if (!$order || $order->payment_status !== 'paid') {
                    continue;
                }
                $unitsSold += (int) $i->quantity;
                $revenue += (int) $i->total_price;
            }
            $rows[] = [
                'id' => (int) $p->id,
                'title' => $p->title,
                'status' => $p->status,
                'viewCount' => (int) $p->view_count,
                'stock' => $stock,
                'unitsSold' => $unitsSold,
                'revenue' => $revenue,
            ];
        }
        usort($rows, fn ($a, $b) => $b['revenue'] <=> $a['revenue']);
        $topViewed = $rows;
        usort($topViewed, fn ($a, $b) => $b['viewCount'] <=> $a['viewCount']);
        return ['byRevenue' => array_slice($rows, 0, 20), 'topViewed' => array_slice($topViewed, 0, 5)];
    }

    // ─── گزارش کاربران ───
    public static function usersReport(): array
    {
        $registrations = array_map(function (array $m) {
            $m['count'] = Dto::rows('users')->filter(
                fn (object $u) => substr((string) $u->created_at, 0, 7) === $m['key']
            )->count();
            return $m;
        }, self::lastMonths(6));

        $buyers = [];
        foreach (Dto::rows('users')->whereNull('deleted_at') as $u) {
            $orders = Dto::rows('orders')->filter(
                fn (object $o) => (int) $o->user_id === (int) $u->id && $o->payment_status === 'paid'
            );
            if ($orders->count() === 0) {
                continue;
            }
            $buyers[] = [
                'id' => (int) $u->id,
                'name' => Dto::userNameOf((int) $u->id),
                'ordersCount' => $orders->count(),
                'totalSpent' => $orders->sum(fn (object $o) => (int) $o->total_amount),
            ];
        }
        usort($buyers, fn ($a, $b) => $b['totalSpent'] <=> $a['totalSpent']);

        return [
            'registrations' => $registrations,
            'topBuyers' => array_slice($buyers, 0, 5),
            'byRole' => [
                'customer' => Dto::rows('users')->where('role', 'customer')->count(),
                'seller' => Dto::rows('users')->where('role', 'seller')->count(),
                'admin' => Dto::rows('users')->filter(fn (object $u) => in_array($u->role, ['admin', 'super_admin'], true))->count(),
            ],
        ];
    }

    // ─── گزارش درآمد ───
    public static function revenueReport(): array
    {
        $byMethod = [];
        foreach (['zarinpal', 'mellat', 'saman', 'wallet'] as $method) {
            $matches = Dto::rows('payments')->filter(
                fn (object $p) => $p->status === 'success' && $p->method === $method && $p->order_id !== null
            );
            $byMethod[] = [
                'method' => $method,
                'methodFa' => Dto::PAYMENT_METHOD_FA[$method] ?? $method,
                'total' => $matches->sum(fn (object $p) => (int) $p->amount),
                'count' => $matches->count(),
            ];
        }
        $monthly = array_map(function (array $m) {
            $m['revenue'] = Dto::rows('payments')->filter(
                fn (object $p) => $p->status === 'success' && $p->order_id !== null
                    && $p->paid_at !== null && substr((string) $p->paid_at, 0, 7) === $m['key']
            )->sum(fn (object $p) => (int) $p->amount);
            return $m;
        }, self::lastMonths(6));

        return [
            'byMethod' => $byMethod,
            'monthly' => $monthly,
            'refunded' => Dto::rows('payments')->where('status', 'refunded')->sum(fn (object $p) => (int) $p->amount),
            'walletDeposits' => Dto::rows('payments')->filter(
                fn (object $p) => $p->status === 'success' && $p->order_id === null
            )->sum(fn (object $p) => (int) $p->amount),
        ];
    }

    // ─── تنظیمات ───
    public static function getSettings(): array
    {
        return Dto::rows('settings')->mapWithKeys(fn (object $r) => [$r->key => $r->value])->all();
    }

    public static function updateSettings(object $admin, array $patch): array
    {
        foreach ($patch as $key => $value) {
            if (!in_array($key, self::SETTINGS_KEYS, true)) {
                continue;
            }
            $string = is_scalar($value) ? (string) $value : json_encode($value, JSON_UNESCAPED_UNICODE);
            DB::table('settings')->updateOrInsert(['key' => $key], ['value' => $string]);
        }
        Dto::flush();
        Dto::logActivity($admin->id, 'settings.update', null, null, 'بروزرسانی تنظیمات سایت');
        return self::getSettings();
    }

    // ─── مدیریت کاربران ───
    public static function listUsers(array $filters): array
    {
        $list = Dto::rows('users')->whereNull('deleted_at');
        if (!empty($filters['q'])) {
            $q = trim($filters['q']);
            $qLower = mb_strtolower($q);
            $list = $list->filter(fn (object $u) => str_contains("{$u->first_name} {$u->last_name}", $q)
                || str_contains((string) $u->phone, $q)
                || str_contains(mb_strtolower((string) ($u->email ?? '')), $qLower));
        }
        if (!empty($filters['role'])) {
            $list = $list->where('role', $filters['role']);
        }
        if (!empty($filters['status'])) {
            $list = $list->where('status', $filters['status']);
        }
        $list = $list->sortByDesc('id')->values();
        $rows = $list->map(function (object $u) {
            $orders = Dto::rows('orders')->filter(
                fn (object $o) => (int) $o->user_id === (int) $u->id && $o->payment_status === 'paid'
            );
            return array_merge(Dto::userDto($u), [
                'ordersCount' => $orders->count(),
                'totalSpent' => $orders->sum(fn (object $o) => (int) $o->total_amount),
            ]);
        })->values();
        $page = $filters['page'];
        $perPage = $filters['perPage'];
        return ['items' => $rows->slice(($page - 1) * $perPage, $perPage)->values()->all(), 'total' => $rows->count()];
    }

    public static function updateUserStatus(object $admin, int $userId, string $status): array
    {
        $user = Dto::rows('users')->first(fn (object $u) => (int) $u->id === $userId && $u->deleted_at === null);
        if (!$user) {
            throw ApiException::notFound('کاربر یافت نشد');
        }
        if ((int) $user->id === (int) $admin->id) {
            // apiError(422, msg) — بدون نقشه errors، مطابق نسخه TS
            throw new ApiException(422, 'نمی‌توانید وضعیت حساب خودتان را تغییر دهید');
        }
        DB::table('users')->where('id', $userId)->update(['status' => $status, 'updated_at' => Dto::now()]);
        Dto::flush();
        Dto::logActivity($admin->id, "user.{$status}", 'user', $userId, "وضعیت کاربر " . Dto::userNameOf($userId) . " به «{$status}» تغییر یافت");
        return Dto::userDto(Dto::find('users', $userId));
    }
}
