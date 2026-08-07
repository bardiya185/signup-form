<?php

namespace App\Support;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * نگاشت‌گر DTO — پورت یک‌به‌یک serializers.ts و resources.ts بک‌اند فعلی.
 * خروجی‌ها دقیقاً همان کلیدهای camelCase قرارداد فعلی را دارند.
 *
 * خواندن‌ها با کش درون‌درخواستی از دیتابیس واقعی انجام می‌شود؛
 * بعد از هر نوشتن، Dto::flush() صدا زده می‌شود.
 */
final class Dto
{
    public const ORDER_STATUS_FA = [
        'pending' => 'در انتظار بررسی', 'processing' => 'در حال پردازش', 'shipped' => 'ارسال شده',
        'delivered' => 'تحویل شده', 'cancelled' => 'لغو شده', 'returned' => 'مرجوع شده',
    ];
    public const PAYMENT_STATUS_FA = [
        'pending' => 'در انتظار پرداخت', 'paid' => 'پرداخت شده', 'failed' => 'پرداخت ناموفق', 'refunded' => 'بازگشت وجه',
    ];
    public const PAYMENT_METHOD_FA = [
        'zarinpal' => 'زرین‌پال', 'mellat' => 'بانک ملت', 'saman' => 'بانک سامان', 'wallet' => 'کیف پول',
    ];
    public const TICKET_STATUS_FA = ['open' => 'باز', 'answered' => 'پاسخ داده شده', 'closed' => 'بسته شده'];
    public const TICKET_PRIORITY_FA = ['low' => 'کم', 'medium' => 'متوسط', 'high' => 'زیاد', 'urgent' => 'فوری'];
    public const TICKET_DEPARTMENT_FA = [
        'orders' => 'پیگیری سفارش', 'payments' => 'مالی و پرداخت', 'returns' => 'بازگشت کالا',
        'technical' => 'فنی', 'general' => 'عمومی',
    ];
    public const USER_STATUS_FA = ['active' => 'فعال', 'banned' => 'مسدود', 'inactive' => 'غیرفعال'];
    public const SELLER_STATUS_FA = [
        'pending' => 'در انتظار تایید', 'approved' => 'تایید شده', 'rejected' => 'رد شده', 'suspended' => 'معلق',
    ];

    /** @var array<string, Collection<int, object>> کش درون‌درخواستی جداول */
    private static array $cache = [];

    /** @return Collection<int, object> */
    public static function rows(string $table): Collection
    {
        return self::$cache[$table] ??= DB::table($table)->get();
    }

    /** بعد از هر نوشتن روی دیتابیس صدا زده می‌شود تا کش تازه شود */
    public static function flush(): void
    {
        self::$cache = [];
    }

    public static function find(string $table, int $id): ?object
    {
        return self::rows($table)->firstWhere('id', $id);
    }

    /** دیکد ستون json (رشته خام از DB) */
    public static function js(mixed $value): mixed
    {
        if (is_string($value)) {
            $decoded = json_decode($value, true);
            return $decoded === null && $value !== 'null' ? [] : $decoded;
        }
        return $value ?? [];
    }

    public static function now(): string
    {
        // sqlite → رشته ISO-8601 (T...Z) برابر خروجی فعلی؛ mysql → فرمت datetime
        return DB::connection()->getDriverName() === 'sqlite'
            ? now()->format('Y-m-d\TH:i:s\Z')
            : now()->format('Y-m-d H:i:s');
    }

    /** زمان آینده به همان قالب now() */
    public static function future(int $seconds): string
    {
        return DB::connection()->getDriverName() === 'sqlite'
            ? now()->addSeconds($seconds)->format('Y-m-d\TH:i:s\Z')
            : now()->addSeconds($seconds)->format('Y-m-d H:i:s');
    }

    // ─── کاربر ───
    public static function userNameOf(int $id): string
    {
        $u = self::find('users', $id);
        if (!$u) return 'کاربر گینان‌کالا';
        return trim($u->first_name . ' ' . $u->last_name) ?: $u->phone;
    }

    public static function userDto(object $u): array
    {
        return [
            'id' => $u->id,
            'firstName' => $u->first_name,
            'lastName' => $u->last_name,
            'fullName' => trim($u->first_name . ' ' . $u->last_name) ?: $u->phone,
            'email' => $u->email,
            'phone' => $u->phone,
            'nationalCode' => $u->national_code,
            'avatar' => $u->avatar,
            'birthDate' => $u->birth_date,
            'gender' => $u->gender,
            'emailVerifiedAt' => $u->email_verified_at,
            'phoneVerifiedAt' => $u->phone_verified_at,
            'role' => $u->role,
            'status' => $u->status,
            'statusFa' => self::USER_STATUS_FA[$u->status] ?? $u->status,
            'createdAt' => $u->created_at,
        ];
    }

    // ─── آدرس ───
    public static function addressDto(object $a): array
    {
        $province = self::find('provinces', (int) $a->province_id);
        $city = self::find('cities', (int) $a->city_id);
        return [
            'id' => $a->id,
            'title' => $a->title,
            'province' => $province ? ['id' => $province->id, 'name' => $province->name] : null,
            'city' => $city ? ['id' => $city->id, 'name' => $city->name] : null,
            'fullAddress' => $a->full_address,
            'postalCode' => $a->postal_code,
            'lat' => $a->lat !== null ? (float) $a->lat : null,
            'lng' => $a->lng !== null ? (float) $a->lng : null,
            'receiverName' => $a->receiver_name,
            'receiverPhone' => $a->receiver_phone,
            'isDefault' => (bool) $a->is_default,
        ];
    }

    // ─── لوک‌اپ‌ها ───
    public static function colorOf(?int $id): ?array
    {
        $c = $id === null ? null : self::find('colors', $id);
        return $c ? ['id' => $c->id, 'name' => $c->name, 'hex' => $c->hex_code] : null;
    }

    public static function sizeOf(?int $id): ?array
    {
        $s = $id === null ? null : self::find('sizes', $id);
        return $s ? ['id' => $s->id, 'name' => $s->name, 'type' => $s->type] : null;
    }

    public static function guaranteeOf(?int $id): ?array
    {
        $g = $id === null ? null : self::find('guarantees', $id);
        return $g ? ['id' => $g->id, 'title' => $g->title, 'months' => $g->months] : null;
    }

    public static function brandOf(?int $id): ?array
    {
        $b = $id === null ? null : self::find('brands', $id);
        return $b ? ['id' => $b->id, 'title' => $b->title, 'slug' => $b->slug, 'logo' => $b->logo] : null;
    }

    public static function sellerOf(?int $id): ?array
    {
        $s = $id === null ? null : self::find('sellers', $id);
        return $s ? ['id' => $s->id, 'shopName' => $s->shop_name, 'slug' => $s->slug, 'rating' => (float) $s->rating] : null;
    }

    public static function categoryMiniOf(?int $id): ?array
    {
        $c = $id === null ? null : self::find('categories', $id);
        return $c ? ['id' => $c->id, 'title' => $c->title, 'slug' => $c->slug] : null;
    }

    // ─── پیشنهاد و قیمت ───
    public static function activeOfferFor(int $variantId): ?object
    {
        $now = time();
        return self::rows('special_offers')->first(
            fn (object $o) => (bool) $o->is_active
                && (int) $o->product_variant_id === $variantId
                && strtotime((string) $o->starts_at) <= $now
                && $now <= strtotime((string) $o->expires_at),
        );
    }

    public static function effectivePriceOf(object $variant): int
    {
        $offer = self::activeOfferFor((int) $variant->id);
        if ($offer) return (int) $offer->discount_price;
        return (int) ($variant->sale_price ?? $variant->price);
    }

    private static function discountPercentOf(int $price, int $effective): int
    {
        return $price > $effective ? (int) round((($price - $effective) / $price) * 100) : 0;
    }

    public static function variantDto(object $v): array
    {
        $offer = self::activeOfferFor((int) $v->id);
        $effective = self::effectivePriceOf($v);
        return [
            'id' => $v->id,
            'sku' => $v->sku,
            'price' => (int) $v->price,
            'salePrice' => $v->sale_price !== null ? (int) $v->sale_price : null,
            'effectivePrice' => $effective,
            'discountPercent' => self::discountPercentOf((int) $v->price, $effective),
            'stock' => (int) $v->stock,
            'maxPerOrder' => (int) $v->max_per_order,
            'color' => self::colorOf($v->color_id !== null ? (int) $v->color_id : null),
            'size' => self::sizeOf($v->size_id !== null ? (int) $v->size_id : null),
            'guarantee' => self::guaranteeOf($v->guarantee_id !== null ? (int) $v->guarantee_id : null),
            'isIncredible' => (bool) $offer,
            'offerEndsAt' => $offer?->expires_at,
        ];
    }

    // ─── آمار دیدگاه و فروش ───
    public static function reviewStatsOf(int $productId): array
    {
        $list = self::rows('reviews')->where('product_id', $productId)->where('status', 'approved');
        if ($list->isEmpty()) return ['rating' => 0, 'count' => 0];
        return ['rating' => round($list->avg('rating'), 1), 'count' => $list->count()];
    }

    public static function soldScoreOf(int $productId): int
    {
        $variantIds = self::rows('product_variants')->where('product_id', $productId)->pluck('id');
        $sold = self::rows('special_offers')->whereIn('product_variant_id', $variantIds)->sum('sold_count');
        return (int) $sold + self::reviewStatsOf($productId)['count'] * 5;
    }

    /** @return Collection<int, object> */
    private static function activeVariantsOf(int $productId): Collection
    {
        return self::rows('product_variants')->where('product_id', $productId)->where('is_active', 1)->values();
    }

    public static function aggregatesOf(object $product): array
    {
        $variants = self::activeVariantsOf((int) $product->id);
        $maxPrice = $variants->max('price') ?? 0;
        $minEffective = $variants->map(fn (object $v) => self::effectivePriceOf($v))->min() ?? 0;
        return [
            'minEffective' => (int) $minEffective,
            'maxPrice' => (int) $maxPrice,
            'totalStock' => (int) $variants->sum('stock'),
            'hasDiscount' => $minEffective < $maxPrice || $variants->contains(fn (object $v) => (bool) self::activeOfferFor((int) $v->id)),
        ];
    }

    // ─── کارت محصول ───
    public static function productCardDto(object $product): array
    {
        $variants = self::activeVariantsOf((int) $product->id);
        $image = self::rows('product_images')
            ->where('product_id', $product->id)
            ->sortBy([['is_primary', 'desc'], ['sort_order', 'asc']])
            ->first();

        $prices = $variants->map(fn (object $v) => (int) $v->price);
        $effective = $variants->map(fn (object $v) => self::effectivePriceOf($v));
        $maxPrice = $prices->max() ?? 0;
        $minEffective = $effective->min() ?? 0;

        $colorIds = $variants->pluck('color_id')->filter()->unique();
        $stats = self::reviewStatsOf((int) $product->id);

        return [
            'id' => $product->id,
            'slug' => $product->slug,
            'title' => $product->title,
            'image' => $image->image_path ?? '/products/real/unique/book.jpg',
            'price' => (int) $maxPrice,
            'effectivePrice' => (int) $minEffective,
            'discountPercent' => self::discountPercentOf((int) $maxPrice, (int) $minEffective),
            'rating' => $stats['rating'],
            'reviewCount' => $stats['count'],
            'stock' => (int) $variants->sum('stock'),
            'colors' => $colorIds->map(fn ($id) => self::colorOf((int) $id))->filter()->values()->all(),
            'brand' => self::brandOf($product->brand_id !== null ? (int) $product->brand_id : null),
            'category' => self::categoryMiniOf((int) $product->category_id),
            'seller' => self::sellerOf($product->seller_id !== null ? (int) $product->seller_id : null),
            'isIncredible' => $variants->contains(fn (object $v) => (bool) self::activeOfferFor((int) $v->id)),
            'isFeatured' => (bool) $product->is_featured,
        ];
    }

    // ─── جزییات محصول ───
    public static function productDetailDto(object $product): array
    {
        $breadcrumb = [];
        $cursor = self::find('categories', (int) $product->category_id);
        $guard = 0;
        while ($cursor && $guard++ < 50) {
            array_unshift($breadcrumb, ['id' => $cursor->id, 'title' => $cursor->title, 'slug' => $cursor->slug]);
            $cursor = $cursor->parent_id !== null ? self::find('categories', (int) $cursor->parent_id) : null;
        }

        $images = self::rows('product_images')
            ->where('product_id', $product->id)
            ->sortBy('sort_order')
            ->map(fn (object $i) => [
                'id' => $i->id,
                'url' => $i->image_path,
                'alt' => $i->alt_text ?? $product->title,
                'isPrimary' => (bool) $i->is_primary,
            ])->values()->all();

        $attributes = self::rows('product_attributes')
            ->where('product_id', $product->id)
            ->map(function (object $pa) {
                $attr = self::find('attributes', (int) $pa->attribute_id);
                if (!$attr) return null;
                $value = $pa->custom_value ?? '';
                if ($pa->attribute_value_id !== null) {
                    $value = self::find('attribute_values', (int) $pa->attribute_value_id)->value ?? $value;
                }
                return ['title' => $attr->title, 'value' => $value];
            })
            ->filter()->values()->all();

        return array_merge(self::productCardDto($product), [
            'shortDescription' => $product->short_description,
            'body' => $product->body,
            'images' => $images,
            'variants' => self::activeVariantsOf((int) $product->id)->map(fn (object $v) => self::variantDto($v))->values()->all(),
            'attributes' => $attributes,
            'breadcrumb' => $breadcrumb,
            'questionsCount' => self::rows('product_questions')->where('product_id', $product->id)->where('status', '!=', 'rejected')->count(),
            'viewCount' => (int) $product->view_count,
        ]);
    }

    // ─── درخت دسته‌بندی ───
    public static function categoryTreeDto(?int $parentId = null): array
    {
        return self::rows('categories')
            ->where('parent_id', $parentId)
            ->where('is_active', 1)
            ->sortBy('sort_order')
            ->map(fn (object $c) => [
                'id' => $c->id,
                'title' => $c->title,
                'slug' => $c->slug,
                'icon' => $c->icon,
                'image' => $c->image,
                'children' => self::categoryTreeDto((int) $c->id),
            ])->values()->all();
    }

    /** شناسه دسته و همه زیرشاخه‌های فعال (معادل boundaryCategoryIds) */
    public static function boundaryCategoryIds(string $slug): array
    {
        $root = self::rows('categories')->firstWhere('slug', $slug);
        if (!$root) return [];
        $ids = [(int) $root->id];
        $walk = function (int $parentId) use (&$ids, &$walk): void {
            foreach (self::rows('categories')->where('parent_id', $parentId)->where('is_active', 1) as $child) {
                $ids[] = (int) $child->id;
                $walk((int) $child->id);
            }
        };
        $walk((int) $root->id);
        return $ids;
    }

    // ─── بنر و پیشنهاد شگفت‌انگیز ───
    public static function bannerDto(object $b): array
    {
        return ['id' => $b->id, 'title' => $b->title, 'image' => $b->image, 'link' => $b->link];
    }

    public static function offerDto(object $offer): ?array
    {
        $variant = self::find('product_variants', (int) $offer->product_variant_id);
        if (!$variant) return null;
        $product = self::find('products', (int) $variant->product_id);
        if (!$product || $product->status !== 'active' || $product->deleted_at) return null;

        $card = self::productCardDto($product);
        $card['price'] = (int) $variant->price;
        $card['effectivePrice'] = (int) $offer->discount_price;
        $card['discountPercent'] = (int) $offer->discount_percentage;
        $card['isIncredible'] = true;

        return [
            'id' => $offer->id,
            'discountPercentage' => (int) $offer->discount_percentage,
            'expiresAt' => $offer->expires_at,
            'stock' => (int) $offer->stock,
            'soldCount' => (int) $offer->sold_count,
            'soldPercent' => min(100, (int) round(((int) $offer->sold_count / ((int) $offer->stock + (int) $offer->sold_count)) * 100)),
            'variantId' => $variant->id,
            'product' => $card,
        ];
    }

    // ─── دیدگاه و پرسش ───
    public static function reviewDto(object $r): array
    {
        return [
            'id' => $r->id,
            'title' => $r->title,
            'body' => $r->body,
            'rating' => (int) $r->rating,
            'pros' => self::js($r->pros),
            'cons' => self::js($r->cons),
            'authorName' => self::userNameOf((int) $r->user_id),
            'isBuyer' => (bool) $r->is_buyer,
            'likesCount' => (int) $r->likes_count,
            'dislikesCount' => (int) $r->dislikes_count,
            'createdAt' => $r->created_at,
        ];
    }

    public static function questionDto(object $q): array
    {
        return [
            'id' => $q->id,
            'question' => $q->question,
            'answer' => $q->answer,
            'askedBy' => self::userNameOf((int) $q->user_id),
            'answeredAt' => $q->answered_at,
            'createdAt' => $q->created_at,
        ];
    }

    // ─── موتور لیست محصولات (پورت queryProducts) ───
    public static function matchesQuery(object $product, string $q): bool
    {
        $needle = mb_strtolower(trim($q));
        if ($needle === '') return true;
        $brand = $product->brand_id !== null ? self::find('brands', (int) $product->brand_id) : null;
        $haystack = mb_strtolower(implode(' ', [
            $product->title, $product->short_description ?? '', $brand?->title ?? '', $brand?->slug ?? '',
        ]));
        return str_contains($haystack, $needle);
    }

    /**
     * @param array{categorySlug?: string, brandSlugs?: array<int,string>, colorIds?: array<int,int>, attributeValueIds?: array<int,int>, q?: string, minPrice?: ?int, maxPrice?: ?int, inStock?: bool, hasDiscount?: bool, sort?: string, page: int, perPage: int} $params
     * @return array{items: array<int, array>, total: int}
     */
    public static function queryProducts(array $params): array
    {
        $pool = self::rows('products')->where('status', 'active')->whereNull('deleted_at')->values();

        if (!empty($params['categorySlug'])) {
            $ids = self::boundaryCategoryIds($params['categorySlug']);
            $pool = $pool->whereIn('category_id', $ids)->values();
        }
        if (!empty($params['brandSlugs'])) {
            $brandIds = self::rows('brands')->whereIn('slug', $params['brandSlugs'])->pluck('id');
            $pool = $pool->filter(fn (object $p) => $p->brand_id !== null && $brandIds->contains($p->brand_id))->values();
        }
        if (!empty($params['colorIds'])) {
            $pool = $pool->filter(fn (object $p) => self::rows('product_variants')
                ->where('product_id', $p->id)->where('is_active', 1)
                ->whereIn('color_id', $params['colorIds'])->isNotEmpty())->values();
        }
        if (!empty($params['attributeValueIds'])) {
            $pool = $pool->filter(fn (object $p) => self::rows('product_attributes')
                ->where('product_id', $p->id)
                ->whereIn('attribute_value_id', $params['attributeValueIds'])->isNotEmpty())->values();
        }
        if (!empty($params['q'])) {
            $pool = $pool->filter(fn (object $p) => self::matchesQuery($p, $params['q']))->values();
        }
        if (($params['minPrice'] ?? null) !== null) {
            $pool = $pool->filter(fn (object $p) => self::aggregatesOf($p)['minEffective'] >= $params['minPrice'])->values();
        }
        if (($params['maxPrice'] ?? null) !== null) {
            $pool = $pool->filter(fn (object $p) => self::aggregatesOf($p)['minEffective'] <= $params['maxPrice'])->values();
        }
        if (!empty($params['inStock'])) {
            $pool = $pool->filter(fn (object $p) => self::aggregatesOf($p)['totalStock'] > 0)->values();
        }
        if (!empty($params['hasDiscount'])) {
            $pool = $pool->filter(fn (object $p) => self::aggregatesOf($p)['hasDiscount'])->values();
        }

        $sort = $params['sort'] ?? 'most_relevant';
        $pool = $pool->sort(match ($sort) {
            'best_selling' => fn (object $a, object $b) => self::soldScoreOf((int) $b->id) <=> self::soldScoreOf((int) $a->id),
            'most_viewed' => fn (object $a, object $b) => $b->view_count <=> $a->view_count,
            'highest_rated' => fn (object $a, object $b) => self::reviewStatsOf((int) $b->id)['rating'] <=> self::reviewStatsOf((int) $a->id)['rating'],
            'newest' => fn (object $a, object $b) => strcmp((string) $b->created_at, (string) $a->created_at),
            'price_asc' => fn (object $a, object $b) => self::aggregatesOf($a)['minEffective'] <=> self::aggregatesOf($b)['minEffective'],
            'price_desc' => fn (object $a, object $b) => self::aggregatesOf($b)['minEffective'] <=> self::aggregatesOf($a)['minEffective'],
            'highest_discount' => function (object $a, object $b) {
                $discount = fn (object $p) => (self::aggregatesOf($p)['maxPrice'] - self::aggregatesOf($p)['minEffective']) / max(1, self::aggregatesOf($p)['maxPrice']);
                return $discount($b) <=> $discount($a);
            },
            default => fn (object $a, object $b) => ((int) $b->is_featured <=> (int) $a->is_featured) ?: ($b->view_count <=> $a->view_count),
        })->values();

        $total = $pool->count();
        $items = $pool->slice(($params['page'] - 1) * $params['perPage'], $params['perPage'])
            ->map(fn (object $p) => self::productCardDto($p))->values()->all();
        return ['items' => $items, 'total' => $total];
    }

    public static function relatedProducts(object $product, int $limit = 6): array
    {
        return self::rows('products')
            ->where('status', 'active')->whereNull('deleted_at')
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->take($limit)
            ->map(fn (object $p) => self::productCardDto($p))->values()->all();
    }

    /** فیلترهای در دسترس یک دسته (پورت buildCategoryFilters) */
    public static function buildCategoryFilters(?string $categorySlug = null, ?string $q = null): array
    {
        $pool = self::rows('products')->where('status', 'active')->whereNull('deleted_at')->values();
        if ($categorySlug) {
            $ids = self::boundaryCategoryIds($categorySlug);
            $pool = $pool->whereIn('category_id', $ids)->values();
        }
        if ($q) {
            $pool = $pool->filter(fn (object $p) => self::matchesQuery($p, $q))->values();
        }

        $brandCounts = [];
        foreach ($pool as $p) {
            if ($p->brand_id !== null) $brandCounts[$p->brand_id] = ($brandCounts[$p->brand_id] ?? 0) + 1;
        }
        $brands = [];
        foreach ($brandCounts as $id => $count) {
            $b = self::find('brands', (int) $id);
            if ($b) $brands[] = ['id' => $b->id, 'title' => $b->title, 'slug' => $b->slug, 'logo' => $b->logo, 'count' => $count];
        }
        usort($brands, fn (array $a, array $b) => $b['count'] <=> $a['count']);

        $colorCounts = [];
        foreach ($pool as $p) {
            $ids = self::rows('product_variants')->where('product_id', $p->id)->where('is_active', 1)
                ->pluck('color_id')->filter()->unique();
            foreach ($ids as $id) $colorCounts[$id] = ($colorCounts[$id] ?? 0) + 1;
        }
        $colors = [];
        foreach ($colorCounts as $id => $count) {
            $c = self::find('colors', (int) $id);
            if ($c) $colors[] = ['id' => $c->id, 'name' => $c->name, 'hex' => $c->hex_code, 'count' => $count];
        }

        $attrValues = [];
        foreach ($pool as $p) {
            foreach (self::rows('product_attributes')->where('product_id', $p->id)->whereNotNull('attribute_value_id') as $pa) {
                $attr = self::find('attributes', (int) $pa->attribute_id);
                if (!$attr || !(bool) $attr->filterable) continue;
                $attrValues[$attr->id][$pa->attribute_value_id] = ($attrValues[$attr->id][$pa->attribute_value_id] ?? 0) + 1;
            }
        }
        $attributes = [];
        foreach ($attrValues as $attrId => $values) {
            $attr = self::find('attributes', (int) $attrId);
            $vals = [];
            foreach ($values as $vid => $count) {
                $av = self::find('attribute_values', (int) $vid);
                if ($av) $vals[] = ['id' => $av->id, 'value' => $av->value, 'count' => $count];
            }
            if ($vals) $attributes[] = ['id' => $attr->id, 'title' => $attr->title, 'values' => $vals];
        }

        $effs = $pool->map(fn (object $p) => self::aggregatesOf($p)['minEffective']);
        return [
            'brands' => $brands,
            'colors' => $colors,
            'attributes' => $attributes,
            'priceRange' => ['min' => (int) ($effs->min() ?? 0), 'max' => (int) ($effs->max() ?? 0)],
        ];
    }

    // ─── سفارش ───
    public static function orderItemDto(object $item): array
    {
        $variant = self::find('product_variants', (int) $item->product_variant_id);
        $product = $variant ? self::find('products', (int) $variant->product_id) : null;
        $image = null;
        if ($product) {
            $image = self::rows('product_images')->where('product_id', $product->id)->where('is_primary', 1)->first()->image_path ?? null;
        }
        return [
            'id' => $item->id,
            'productVariantId' => (int) $item->product_variant_id,
            'productTitle' => $item->product_title,
            'productSlug' => $product?->slug,
            'image' => $image,
            'variantInfo' => self::js($item->variant_info),
            'quantity' => (int) $item->quantity,
            'unitPrice' => (int) $item->unit_price,
            'totalPrice' => (int) $item->total_price,
        ];
    }

    public static function orderDto(object $o, bool $withItems = true): array
    {
        $items = self::rows('order_items')->where('order_id', $o->id)->values();
        $address = self::find('addresses', (int) $o->address_id);
        $status = (string) $o->status;
        return [
            'id' => $o->id,
            'orderNumber' => $o->order_number,
            'status' => $status,
            'statusFa' => self::ORDER_STATUS_FA[$status] ?? $status,
            'paymentStatus' => $o->payment_status,
            'paymentStatusFa' => self::PAYMENT_STATUS_FA[$o->payment_status] ?? $o->payment_status,
            'paymentMethod' => $o->payment_method,
            'paymentMethodFa' => self::PAYMENT_METHOD_FA[$o->payment_method] ?? $o->payment_method,
            'subtotal' => (int) $o->subtotal,
            'shippingCost' => (int) $o->shipping_cost,
            'taxAmount' => (int) $o->tax_amount,
            'discountAmount' => (int) $o->discount_amount,
            'totalAmount' => (int) $o->total_amount,
            'couponDiscount' => (int) $o->coupon_discount,
            'notes' => $o->notes,
            'cancellationReason' => $o->cancellation_reason,
            'address' => $address ? self::addressDto($address) : null,
            'items' => $withItems ? $items->map(fn (object $i) => self::orderItemDto($i))->all() : [],
            'itemsCount' => (int) $items->sum('quantity'),
            'canCancel' => in_array($status, ['pending', 'processing'], true) && $o->payment_status !== 'refunded',
            'canReturn' => $status === 'delivered',
            'buyerName' => self::userNameOf((int) $o->user_id),
            'shippedAt' => $o->shipped_at,
            'deliveredAt' => $o->delivered_at,
            'createdAt' => $o->created_at,
        ];
    }

    public static function orderHistoryDto(object $h): array
    {
        return [
            'id' => $h->id,
            'oldStatus' => $h->old_status ? (self::ORDER_STATUS_FA[$h->old_status] ?? $h->old_status) : null,
            'newStatus' => self::ORDER_STATUS_FA[$h->new_status] ?? $h->new_status,
            'description' => $h->description,
            'actor' => $h->changed_by ? self::userNameOf((int) $h->changed_by) : 'سیستم',
            'createdAt' => $h->created_at,
        ];
    }

    public static function orderDetailDto(object $o): array
    {
        $history = self::rows('order_status_history')->where('order_id', $o->id)
            ->sortBy('created_at')->map(fn (object $h) => self::orderHistoryDto($h))->values()->all();
        return array_merge(self::orderDto($o), ['history' => $history]);
    }

    // ─── پرداخت و کیف پول ───
    public static function paymentDto(object $p): array
    {
        $order = $p->order_id !== null ? self::find('orders', (int) $p->order_id) : null;
        $statusFa = match ($p->status) {
            'success' => 'موفق', 'pending' => 'در انتظار', 'failed' => 'ناموفق', default => 'بازگشت وجه',
        };
        return [
            'id' => $p->id,
            'amount' => (int) $p->amount,
            'method' => $p->method,
            'methodFa' => self::PAYMENT_METHOD_FA[$p->method] ?? $p->method,
            'status' => $p->status,
            'statusFa' => $statusFa,
            'transactionId' => $p->transaction_id,
            'refNumber' => $p->ref_number,
            'orderNumber' => $order?->order_number,
            'isWalletCharge' => $p->order_id === null,
            'paidAt' => $p->paid_at,
            'createdAt' => $p->created_at,
        ];
    }

    public static function walletTxDto(object $t): array
    {
        return [
            'id' => $t->id,
            'type' => $t->type,
            'typeFa' => $t->type === 'deposit' ? 'شارژ کیف پول' : 'برداشت از کیف پول',
            'amount' => (int) $t->amount,
            'description' => $t->description,
            'referenceId' => $t->reference_id,
            'createdAt' => $t->created_at,
        ];
    }

    // ─── اعلان ───
    public static function notificationDto(object $n): array
    {
        return [
            'id' => $n->id,
            'type' => $n->type,
            'title' => $n->title,
            'body' => $n->body,
            'data' => $n->data ? self::js($n->data) : null,
            'isRead' => !empty($n->read_at),
            'createdAt' => $n->created_at,
        ];
    }

    // ─── تیکت ───
    public static function ticketMessageDto(object $m): array
    {
        return [
            'id' => $m->id,
            'body' => $m->body,
            'attachments' => self::js($m->attachments),
            'isAdmin' => (bool) $m->is_admin,
            'authorName' => self::userNameOf((int) $m->user_id),
            'createdAt' => $m->created_at,
        ];
    }

    public static function ticketDto(object $t, bool $withMessages = true): array
    {
        $messages = self::rows('ticket_messages')->where('ticket_id', $t->id)->sortBy('created_at')->values();
        $last = $messages->last();
        return [
            'id' => $t->id,
            'subject' => $t->subject,
            'department' => $t->department,
            'departmentFa' => self::TICKET_DEPARTMENT_FA[$t->department] ?? $t->department,
            'priority' => $t->priority,
            'priorityFa' => self::TICKET_PRIORITY_FA[$t->priority] ?? $t->priority,
            'status' => $t->status,
            'statusFa' => self::TICKET_STATUS_FA[$t->status] ?? $t->status,
            'orderNumber' => $t->order_id !== null ? (self::find('orders', (int) $t->order_id)->order_number ?? null) : null,
            'requesterName' => self::userNameOf((int) $t->user_id),
            'messages' => $withMessages ? $messages->map(fn (object $m) => self::ticketMessageDto($m))->all() : [],
            'lastMessageAt' => $last?->created_at ?? $t->created_at,
            'createdAt' => $t->created_at,
        ];
    }

    // ─── بلاگ ───
    public static function blogDto(object $p, bool $withBody = false): array
    {
        return [
            'id' => $p->id,
            'title' => $p->title,
            'slug' => $p->slug,
            'excerpt' => $p->excerpt,
            'body' => $withBody ? $p->body : null,
            'image' => $p->image,
            'authorName' => self::userNameOf((int) $p->author_id),
            'viewCount' => (int) $p->view_count,
            'publishedAt' => $p->published_at,
        ];
    }

    // ─── کوپن ───
    public static function couponDto(object $c): array
    {
        return [
            'id' => $c->id,
            'code' => $c->code,
            'type' => $c->type,
            'typeFa' => $c->type === 'percentage' ? 'درصدی' : 'مبلغی',
            'value' => (int) $c->value,
            'maxDiscount' => $c->max_discount !== null ? (int) $c->max_discount : null,
            'minOrderAmount' => $c->min_order_amount !== null ? (int) $c->min_order_amount : null,
            'usageLimit' => $c->usage_limit !== null ? (int) $c->usage_limit : null,
            'usedCount' => (int) $c->used_count,
            'perUserLimit' => (int) $c->per_user_limit,
            'startsAt' => $c->starts_at,
            'expiresAt' => $c->expires_at,
            'isActive' => (bool) $c->is_active,
            'applicableCategories' => $c->applicable_categories ? self::js($c->applicable_categories) : null,
            'applicableProducts' => $c->applicable_products ? self::js($c->applicable_products) : null,
        ];
    }

    // ─── فروشنده ───
    public static function sellerDto(object $s): array
    {
        return [
            'id' => $s->id,
            'shopName' => $s->shop_name,
            'slug' => $s->slug,
            'logo' => $s->logo,
            'description' => $s->description,
            'phone' => $s->phone,
            'email' => $s->email,
            'nationalId' => $s->national_id,
            'commissionRate' => (float) $s->commission_rate,
            'status' => $s->status,
            'statusFa' => self::SELLER_STATUS_FA[$s->status] ?? $s->status,
            'rating' => (float) $s->rating,
            'ownerName' => self::userNameOf((int) $s->user_id),
            'createdAt' => $s->created_at,
        ];
    }

    public static function settlementDto(object $s): array
    {
        return [
            'id' => $s->id,
            'amount' => (int) $s->amount,
            'status' => $s->status,
            'statusFa' => $s->status === 'paid' ? 'پرداخت شده' : 'در انتظار پرداخت',
            'paidAt' => $s->paid_at,
            'reference' => $s->reference,
            'createdAt' => $s->created_at,
        ];
    }

    public static function activityLogDto(object $l): array
    {
        return [
            'id' => $l->id,
            'action' => $l->action,
            'subjectType' => $l->subject_type,
            'subjectId' => $l->subject_id,
            'description' => $l->description,
            'actorName' => $l->user_id ? self::userNameOf((int) $l->user_id) : 'سیستم',
            'createdAt' => $l->created_at,
        ];
    }

    /** قالب‌بندی عدد با ارقام فارسی (معادل toLocaleString('fa-IR')) */
    public static function faNum(int|float $n): string
    {
        return strtr(number_format((float) $n), '0123456789,', '۰۱۲۳۴۵۶۷۸۹٬');
    }

    /** مقدار تنظیمات از جدول settings */
    public static function setting(string $key, ?string $default = null): ?string
    {
        return self::rows('settings')->firstWhere('key', $key)->value ?? $default;
    }

    // ─── کمکی‌های نوشتنی ───
    public static function issueToken(int $userId, string $name = 'web'): string
    {
        $value = bin2hex(random_bytes(32));
        DB::table('personal_access_tokens')->insert([
            'user_id' => $userId,
            'token' => $value,
            'name' => $name,
            'abilities' => '["*"]',
            'last_used_at' => null,
            'expires_at' => Dto::future(30 * 24 * 3600),
            'revoked_at' => null,
            'created_at' => self::now(),
        ]);
        return $value;
    }

    public static function notify(int $userId, string $type, string $title, string $body, ?array $data = null): void
    {
        DB::table('notifications')->insert([
            'user_id' => $userId, 'type' => $type, 'title' => $title, 'body' => $body,
            'data' => $data !== null ? json_encode($data, JSON_UNESCAPED_UNICODE) : null,
            'read_at' => null, 'created_at' => self::now(), 'updated_at' => self::now(),
        ]);
        self::flush();
    }

    public static function logActivity(?int $userId, string $action, ?string $subjectType = null, ?int $subjectId = null, ?string $description = null): void
    {
        DB::table('activity_logs')->insert([
            'user_id' => $userId, 'action' => $action, 'subject_type' => $subjectType,
            'subject_id' => $subjectId, 'description' => $description, 'created_at' => self::now(),
        ]);
    }
}
