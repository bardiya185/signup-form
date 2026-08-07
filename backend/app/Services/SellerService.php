<?php

namespace App\Services;

use App\Support\ApiException;
use App\Support\Dto;
use Illuminate\Support\Facades\DB;

/**
 * سرویس فروشندگان — پورت یک‌به‌یک seller.service.ts
 * ثبت‌نام فروشنده، ساخت محصول مشترک، داشبورد/محصولات/سفارش‌ها/تسویه‌ها/آنالیتیکس.
 */
class SellerService
{
    // ─── ثبت‌نام فروشنده ───
    public static function registerSeller(object $user, array $input): array
    {
        $existing = Dto::rows('sellers')->firstWhere('user_id', $user->id);
        if ($existing) {
            throw new ApiException(409, 'شما قبلاً درخواست فروشندگی ثبت کرده‌اید');
        }
        $taken = Dto::rows('sellers')->contains(fn (object $s) => $s->shop_name === $input['shop_name']);
        if ($taken) {
            throw ApiException::unprocessable(['shop_name' => ['این نام فروشگاه قبلاً ثبت شده است']]);
        }

        $id = (int) DB::table('sellers')->max('id') + 1;
        $slug = str_replace('  ', ' ', trim(preg_replace('/\s+/u', '-', $input['shop_name'])));
        DB::table('sellers')->insert([
            'id' => $id,
            'user_id' => $user->id,
            'shop_name' => $input['shop_name'],
            'slug' => mb_strtolower($slug) . '-' . $id,
            'logo' => null,
            'description' => null,
            'national_id' => $input['national_id'],
            'phone' => $input['phone'],
            'email' => $input['email'],
            'province_id' => $input['province_id'],
            'city_id' => $input['city_id'],
            'address' => $input['address'],
            'shaba_number' => $input['shaba_number'],
            'commission_rate' => 8,
            'status' => 'pending',
            'rating' => 0,
            'created_at' => Dto::now(),
            'updated_at' => Dto::now(),
        ]);
        Dto::flush();
        Dto::logActivity($user->id, 'seller.register', 'seller', $id, "ثبت درخواست فروشندگی «{$input['shop_name']}»");
        return Dto::sellerDto(Dto::find('sellers', $id));
    }

    // ─── فروشنده جاری ───
    public static function mySeller(object $user): object
    {
        $seller = Dto::rows('sellers')->firstWhere('user_id', $user->id);
        if (!$seller) {
            throw ApiException::notFound('برای دسترسی به پنل فروشندگی ابتدا درخواست خود را ثبت کنید');
        }
        return $seller;
    }

    /** @return int[] */
    private static function sellerVariantIds(int $sellerId): array
    {
        return Dto::rows('product_variants')
            ->filter(fn (object $v) => Dto::rows('products')->contains(
                fn (object $p) => (int) $p->id === (int) $v->product_id && (int) $p->seller_id === $sellerId
            ))
            ->map(fn (object $v) => (int) $v->id)
            ->values()
            ->all();
    }

    /**
     * ساخت محصول جدید — در فرم فروشنده و ادمین مشترک.
     * @return object ردیف محصول ساخته‌شده
     */
    public static function createProductRecord(array $input, int $sellerId, string $status = 'pending_review'): object
    {
        $category = Dto::find('categories', (int) $input['category_id']);
        if (!$category) {
            throw ApiException::unprocessable(['category_id' => ['دسته‌بندی معتبر نیست']]);
        }
        if (isset($input['brand_id']) && !Dto::find('brands', (int) $input['brand_id'])) {
            throw ApiException::unprocessable(['brand_id' => ['برند معتبر نیست']]);
        }
        if (isset($input['sale_price']) && (int) $input['sale_price'] >= (int) $input['price']) {
            throw ApiException::unprocessable(['sale_price' => ['قیمت فروش ویژه باید کمتر از قیمت اصلی باشد']]);
        }

        $id = (int) DB::table('products')->max('id') + 1;
        $slugBase = mb_substr(preg_replace(['/[\s\x{0640}]+/u', '/[؟?]/u'], ['-', ''], $input['title']), 0, 40);
        DB::table('products')->insert([
            'id' => $id,
            'category_id' => (int) $input['category_id'],
            'brand_id' => $input['brand_id'] ?? null,
            'seller_id' => $sellerId,
            'title' => $input['title'],
            'slug' => "{$slugBase}-{$id}",
            'sku' => 'GNK-' . str_pad((string) $id, 5, '0', STR_PAD_LEFT),
            'short_description' => $input['short_description'] ?? null,
            'body' => $input['short_description'] ?? null,
            'status' => $status,
            'is_featured' => 0,
            'is_digital' => 0,
            'weight' => null,
            'dimensions' => null,
            'meta_title' => $input['title'],
            'meta_description' => $input['short_description'] ?? null,
            'view_count' => 0,
            'created_at' => Dto::now(),
            'updated_at' => Dto::now(),
            'deleted_at' => null,
        ]);
        DB::table('product_variants')->insert([
            'id' => (int) DB::table('product_variants')->max('id') + 1,
            'product_id' => $id,
            'sku' => 'GNK-V' . str_pad((string) $id, 4, '0', STR_PAD_LEFT),
            'price' => (int) $input['price'],
            'sale_price' => $input['sale_price'] ?? null,
            'stock' => (int) $input['stock'],
            'max_per_order' => 3,
            'color_id' => $input['color_id'] ?? null,
            'size_id' => null,
            'guarantee_id' => $input['guarantee_id'] ?? 4,
            'is_active' => 1,
            'created_at' => Dto::now(),
            'updated_at' => Dto::now(),
        ]);
        if (!empty($input['image'])) {
            DB::table('product_images')->insert([
                'id' => (int) DB::table('product_images')->max('id') + 1,
                'product_id' => $id,
                'image_path' => $input['image'],
                'alt_text' => $input['title'],
                'sort_order' => 0,
                'is_primary' => 1,
                'created_at' => Dto::now(),
                'updated_at' => Dto::now(),
            ]);
        }
        Dto::flush();
        return Dto::find('products', $id);
    }

    public static function sellerDashboard(object $user): array
    {
        $seller = self::mySeller($user);
        $products = Dto::rows('products')->filter(
            fn (object $p) => (int) $p->seller_id === (int) $seller->id && $p->deleted_at === null
        )->values();
        $variantIds = self::sellerVariantIds((int) $seller->id);
        $paidOrderIds = Dto::rows('orders')->where('payment_status', 'paid')->map(fn (object $o) => (int) $o->id)->all();
        $soldItems = Dto::rows('order_items')->filter(
            fn (object $i) => in_array((int) $i->product_variant_id, $variantIds, true)
                && in_array((int) $i->order_id, $paidOrderIds, true)
        )->values();
        $revenue = $soldItems->sum(fn (object $i) => (int) $i->total_price);
        $pendingSettlement = Dto::rows('seller_settlements')
            ->filter(fn (object $s) => (int) $s->seller_id === (int) $seller->id && $s->status === 'pending')
            ->sum(fn (object $s) => (int) $s->amount);

        $recent = $soldItems
            ->reverse()->values()   // مرتب‌سازی نزولی بر اساس ایندکس درج
            ->slice(-5)
            ->reverse()
            ->map(function (object $i) {
                $order = Dto::find('orders', (int) $i->order_id);
                return [
                    'orderNumber' => $order->order_number,
                    'itemTitle' => $i->product_title,
                    'quantity' => (int) $i->quantity,
                    'total' => (int) $i->total_price,
                    'buyer' => Dto::userNameOf((int) $order->user_id),
                    'createdAt' => $order->created_at,
                ];
            })->values()->all();

        return [
            'seller' => Dto::sellerDto($seller),
            'stats' => [
                'productsTotal' => $products->count(),
                'productsActive' => $products->where('status', 'active')->count(),
                'productsPending' => $products->where('status', 'pending_review')->count(),
                'unitsSold' => $soldItems->sum(fn (object $i) => (int) $i->quantity),
                'ordersCount' => $soldItems->pluck('order_id')->unique()->count(),
                'totalRevenue' => $revenue,
                'pendingSettlement' => $pendingSettlement,
                'rating' => (float) $seller->rating,
            ],
            'recentSales' => $recent,
        ];
    }

    public static function sellerProducts(object $user, int $page, int $perPage): array
    {
        $seller = self::mySeller($user);
        $list = Dto::rows('products')
            ->filter(fn (object $p) => (int) $p->seller_id === (int) $seller->id && $p->deleted_at === null)
            ->sortByDesc('id')->values();
        $items = $list->slice(($page - 1) * $perPage, $perPage)
            ->map(fn (object $p) => array_merge(Dto::productCardDto($p), ['status' => $p->status]))
            ->values()->all();
        return ['items' => $items, 'total' => $list->count()];
    }

    public static function sellerCreateProduct(object $user, array $input): array
    {
        $seller = self::mySeller($user);
        if ($seller->status !== 'approved') {
            throw ApiException::forbidden('فروشگاه شما هنوز تایید نشده است و امکان ثبت محصول ندارید');
        }
        $product = self::createProductRecord($input, (int) $seller->id, 'pending_review');
        Dto::logActivity($user->id, 'seller.product_create', 'product', $product->id, "ثبت محصول «{$product->title}»");
        return ['id' => $product->id, 'slug' => $product->slug];
    }

    public static function sellerUpdateProduct(object $user, int $productId, array $input): array
    {
        $seller = self::mySeller($user);
        $product = Dto::rows('products')->first(
            fn (object $p) => (int) $p->id === $productId && (int) $p->seller_id === (int) $seller->id && $p->deleted_at === null
        );
        if (!$product) {
            throw ApiException::notFound('محصول مورد نظر یافت نشد');
        }
        $patch = [];
        if (isset($input['title']) && $input['title'] !== '') {
            $patch['title'] = $input['title'];
        }
        if (array_key_exists('short_description', $input)) {
            $patch['short_description'] = $input['short_description'];
        }
        $patch['updated_at'] = Dto::now();
        DB::table('products')->where('id', $productId)->update($patch);

        $variant = Dto::rows('product_variants')->firstWhere('product_id', $productId);
        if ($variant) {
            $variantPatch = [];
            if (isset($input['price']) && (int) $input['price'] !== (int) $variant->price) {
                DB::table('product_price_history')->insert([
                    'id' => (int) DB::table('product_price_history')->max('id') + 1,
                    'product_variant_id' => $variant->id,
                    'old_price' => $variant->price,
                    'new_price' => (int) $input['price'],
                    'created_at' => Dto::now(),
                    'updated_at' => Dto::now(),
                ]);
                $variantPatch['price'] = (int) $input['price'];
            }
            if (array_key_exists('sale_price', $input)) {
                $variantPatch['sale_price'] = $input['sale_price'];
            }
            if (isset($input['stock'])) {
                $variantPatch['stock'] = (int) $input['stock'];
            }
            if ($variantPatch) {
                DB::table('product_variants')->where('id', $variant->id)->update($variantPatch);
            }
        }
        Dto::flush();
        return Dto::productCardDto(Dto::find('products', $productId));
    }

    /** @return array<int, array> */
    public static function sellerOrders(object $user): array
    {
        $seller = self::mySeller($user);
        $variantIds = self::sellerVariantIds((int) $seller->id);
        $paidOrderIds = Dto::rows('orders')->where('payment_status', 'paid')->map(fn (object $o) => (int) $o->id)->all();
        return Dto::rows('order_items')
            ->filter(fn (object $i) => in_array((int) $i->product_variant_id, $variantIds, true)
                && in_array((int) $i->order_id, $paidOrderIds, true))
            ->map(function (object $i) {
                $order = Dto::find('orders', (int) $i->order_id);
                return [
                    'id' => (int) $i->id,
                    'orderNumber' => $order->order_number,
                    'orderStatus' => $order->status,
                    'itemTitle' => $i->product_title,
                    'variantInfo' => Dto::js($i->variant_info),
                    'quantity' => (int) $i->quantity,
                    'unitPrice' => (int) $i->unit_price,
                    'total' => (int) $i->total_price,
                    'buyer' => Dto::userNameOf((int) $order->user_id),
                    'createdAt' => $order->created_at,
                ];
            })
            ->sortByDesc('createdAt')
            ->values()->all();
    }

    /** @return array<int, array> */
    public static function sellerSettlements(object $user): array
    {
        $seller = self::mySeller($user);
        return Dto::rows('seller_settlements')
            ->filter(fn (object $s) => (int) $s->seller_id === (int) $seller->id)
            ->sortByDesc('created_at')
            ->map(fn (object $s) => Dto::settlementDto($s))
            ->values()->all();
    }

    private const MONTH_FA = ['دی', 'بهمن', 'اسفند', 'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر'];

    public static function sellerAnalytics(object $user): array
    {
        $seller = self::mySeller($user);
        $variantIds = self::sellerVariantIds((int) $seller->id);
        $paidOrderIds = Dto::rows('orders')->where('payment_status', 'paid')->map(fn (object $o) => (int) $o->id)->all();
        $items = Dto::rows('order_items')->filter(
            fn (object $i) => in_array((int) $i->product_variant_id, $variantIds, true)
                && in_array((int) $i->order_id, $paidOrderIds, true)
        )->values();

        $months = [];
        $today = new \DateTimeImmutable('now', new \DateTimeZone('UTC'));
        for ($i = 5; $i >= 0; $i--) {
            $d = $today->modify('first day of this month')->modify("-{$i} months");
            $months[] = [
                'key' => $d->format('Y-m'),
                'label' => self::MONTH_FA[(int) $d->format('n') - 1],
                'revenue' => 0,
                'units' => 0,
            ];
        }
        foreach ($items as $i) {
            $order = Dto::find('orders', (int) $i->order_id);
            $key = substr((string) $order->created_at, 0, 7);
            foreach ($months as &$m) {
                if ($m['key'] === $key) {
                    $m['revenue'] += (int) $i->total_price;
                    $m['units'] += (int) $i->quantity;
                }
            }
            unset($m);
        }

        $byProduct = [];
        foreach ($items as $i) {
            $variant = Dto::find('product_variants', (int) $i->product_variant_id);
            if (!$variant) {
                continue;
            }
            $pid = (int) $variant->product_id;
            if (!isset($byProduct[$pid])) {
                $byProduct[$pid] = ['title' => $i->product_title, 'revenue' => 0, 'units' => 0];
            }
            $byProduct[$pid]['revenue'] += (int) $i->total_price;
            $byProduct[$pid]['units'] += (int) $i->quantity;
        }
        $top = array_values($byProduct);
        usort($top, fn ($a, $b) => $b['revenue'] <=> $a['revenue']);

        $gross = $items->sum(fn (object $i) => (int) $i->total_price);
        return [
            'monthly' => $months,
            'topProducts' => array_slice($top, 0, 5),
            'commissionRate' => (float) $seller->commission_rate,
            'netRevenue' => $gross * (1 - ((float) $seller->commission_rate) / 100),
        ];
    }
}
