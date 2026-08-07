<?php

namespace App\Services;

use App\Support\ApiException;
use App\Support\Dto;
use Illuminate\Support\Facades\DB;

/**
 * سرویس مدیریت کاتالوگ/تخفیف‌ها/محتوای ادمین — پورت یک‌به‌یک
 * admin-catalog.service.ts و admin-helpers.ts بک‌اند فعلی.
 */
class AdminCatalogService
{
    /** خروجی خام سطر با اصلاح نوع is_active به boolean (مطابق شیء TS) */
    private static function rawRow(object $row): array
    {
        $a = (array) $row;
        if (array_key_exists('is_active', $a)) {
            $a['is_active'] = (bool) $a['is_active'];
        }
        if (array_key_exists('is_featured', $a)) {
            $a['is_featured'] = (bool) $a['is_featured'];
        }
        if (array_key_exists('is_primary', $a)) {
            $a['is_primary'] = (bool) $a['is_primary'];
        }
        return $a;
    }

    // ═══════════ دیدگاه‌ها (ردیف مدیریتی) ═══════════
    private static function toReviewAdminRow(object $review): array
    {
        $product = Dto::find('products', (int) $review->product_id);
        return [
            'id' => (int) $review->id,
            'title' => $review->title,
            'body' => $review->body,
            'rating' => (int) $review->rating,
            'status' => $review->status,
            'isBuyer' => (bool) $review->is_buyer,
            'likesCount' => (int) $review->likes_count,
            'dislikesCount' => (int) $review->dislikes_count,
            'productId' => (int) $review->product_id,
            'productTitle' => $product?->title ?? '—',
            'authorName' => Dto::userNameOf((int) $review->user_id),
            'createdAt' => $review->created_at,
        ];
    }

    private static function toUserishBanner(object $banner): array
    {
        return [
            'id' => (int) $banner->id,
            'title' => $banner->title,
            'image' => $banner->image,
            'link' => $banner->link,
            'position' => $banner->position,
            'sort_order' => (int) $banner->sort_order,
            'is_active' => (bool) $banner->is_active,
            'starts_at' => $banner->starts_at,
            'expires_at' => $banner->expires_at,
        ];
    }

    // ═══════════ محصولات ═══════════
    public static function adminListProducts(array $filters): array
    {
        $list = Dto::rows('products')->whereNull('deleted_at');
        if (!empty($filters['q'])) {
            $q = trim($filters['q']);
            $list = $list->filter(fn (object $p) => str_contains($p->title, $q) || str_contains((string) $p->sku, $q));
        }
        if (!empty($filters['status'])) {
            $list = $list->where('status', $filters['status']);
        }
        if (!empty($filters['category'])) {
            $cat = Dto::rows('categories')->firstWhere('slug', $filters['category']);
            if ($cat) {
                $list = $list->where('category_id', $cat->id);
            }
        }
        $list = $list->sortByDesc('id')->values();
        $rows = $list->map(function (object $p) {
            $variants = Dto::rows('product_variants')->filter(
                fn (object $v) => (int) $v->product_id === (int) $p->id && (int) $v->is_active === 1
            )->values();
            $prices = $variants->map(fn (object $v) => Dto::effectivePriceOf($v))->all();
            $image = Dto::rows('product_images')->first(
                fn (object $i) => (int) $i->product_id === (int) $p->id && (int) $i->is_primary === 1
            );
            return [
                'id' => (int) $p->id,
                'title' => $p->title,
                'slug' => $p->slug,
                'sku' => $p->sku,
                'status' => $p->status,
                'isFeatured' => (bool) $p->is_featured,
                'image' => $image?->image_path,
                'categoryTitle' => Dto::find('categories', (int) $p->category_id)?->title,
                'brandTitle' => $p->brand_id !== null ? Dto::find('brands', (int) $p->brand_id)?->title : null,
                'sellerTitle' => $p->seller_id !== null ? Dto::find('sellers', (int) $p->seller_id)?->shop_name : null,
                'price' => $prices ? min($prices) : 0,
                'stock' => $variants->sum(fn (object $v) => (int) $v->stock),
                'viewCount' => (int) $p->view_count,
                'createdAt' => $p->created_at,
            ];
        })->values();
        $page = $filters['page'];
        $perPage = $filters['perPage'];
        return ['items' => $rows->slice(($page - 1) * $perPage, $perPage)->values()->all(), 'total' => $rows->count()];
    }

    public static function adminCreateProduct(object $admin, array $input): array
    {
        $product = SellerService::createProductRecord(
            $input,
            (int) ($input['seller_id'] ?? 1),
            $input['status'] ?? 'active'
        );
        Dto::logActivity($admin->id, 'product.create', 'product', $product->id, "ایجاد محصول «{$product->title}»");
        return ['id' => (int) $product->id, 'slug' => $product->slug];
    }

    public static function adminUpdateProduct(object $admin, int $productId, array $input): array
    {
        $product = Dto::rows('products')->first(fn (object $p) => (int) $p->id === $productId && $p->deleted_at === null);
        if (!$product) {
            throw ApiException::notFound('محصول یافت نشد');
        }
        $patch = [];
        if (!empty($input['title'])) {
            $patch['title'] = $input['title'];
        }
        if (!empty($input['status'])) {
            $patch['status'] = $input['status'];
        }
        if (array_key_exists('is_featured', $input)) {
            $patch['is_featured'] = $input['is_featured'] ? 1 : 0;
        }
        if (array_key_exists('short_description', $input)) {
            $patch['short_description'] = $input['short_description'];
        }
        $patch['updated_at'] = Dto::now();
        DB::table('products')->where('id', $productId)->update($patch);

        foreach ((array) ($input['variants'] ?? []) as $variantPatch) {
            $variantPatch = (array) $variantPatch;
            $variant = Dto::rows('product_variants')->first(
                fn (object $v) => (int) $v->id === (int) ($variantPatch['id'] ?? 0) && (int) $v->product_id === $productId
            );
            if (!$variant) {
                continue;
            }
            $vPatch = [];
            if (isset($variantPatch['price']) && (int) $variantPatch['price'] !== (int) $variant->price) {
                DB::table('product_price_history')->insert([
                    'id' => (int) DB::table('product_price_history')->max('id') + 1,
                    'product_variant_id' => $variant->id,
                    'old_price' => $variant->price,
                    'new_price' => (int) $variantPatch['price'],
                    'created_at' => Dto::now(),
                    'updated_at' => Dto::now(),
                ]);
                $vPatch['price'] = (int) $variantPatch['price'];
            }
            if (array_key_exists('sale_price', $variantPatch)) {
                $vPatch['sale_price'] = $variantPatch['sale_price'];
            }
            if (isset($variantPatch['stock'])) {
                $vPatch['stock'] = max(0, (int) $variantPatch['stock']);
            }
            if ($vPatch) {
                DB::table('product_variants')->where('id', $variant->id)->update($vPatch);
            }
        }
        Dto::flush();
        $fresh = Dto::find('products', $productId);
        Dto::logActivity($admin->id, 'product.update', 'product', $productId, "ویرایش محصول «{$fresh->title}»");
        return ['id' => $productId];
    }

    public static function adminDeleteProduct(object $admin, int $productId): void
    {
        $product = Dto::rows('products')->first(fn (object $p) => (int) $p->id === $productId && $p->deleted_at === null);
        if (!$product) {
            throw ApiException::notFound('محصول یافت نشد');
        }
        DB::table('products')->where('id', $productId)->update([
            'deleted_at' => Dto::now(),
            'status' => 'inactive',
        ]);
        Dto::flush();
        Dto::logActivity($admin->id, 'product.delete', 'product', $productId, "حذف محصول «{$product->title}»");
    }

    // ═══════════ دسته‌بندی‌ها ═══════════
    public static function adminListCategories(): array
    {
        return Dto::rows('categories')->map(fn (object $c) => array_merge(self::rawRow($c), [
            'productsCount' => Dto::rows('products')->filter(
                fn (object $p) => (int) $p->category_id === (int) $c->id && $p->deleted_at === null
            )->count(),
            'childrenCount' => Dto::rows('categories')->where('parent_id', $c->id)->count(),
        ]))->values()->all();
    }

    public static function adminCreateCategory(object $admin, array $input): array
    {
        $id = (int) DB::table('categories')->max('id') + 1;
        DB::table('categories')->insert([
            'id' => $id,
            'parent_id' => $input['parent_id'] ?? null,
            'title' => $input['title'],
            'slug' => "cat-{$id}",
            'icon' => $input['icon'] ?? null,
            'image' => $input['image'] ?? null,
            'description' => null,
            'sort_order' => $input['sort_order'] ?? 99,
            'is_active' => 1,
            'meta_title' => $input['title'],
            'meta_description' => null,
            'created_at' => Dto::now(),
            'updated_at' => Dto::now(),
        ]);
        Dto::flush();
        Dto::logActivity($admin->id, 'category.create', 'category', $id, "ایجاد دسته «{$input['title']}»");
        return self::rawRow(Dto::find('categories', $id));
    }

    public static function adminUpdateCategory(object $admin, int $id, array $input): array
    {
        $category = Dto::find('categories', $id);
        if (!$category) {
            throw ApiException::notFound('دسته‌بندی یافت نشد');
        }
        DB::table('categories')->where('id', $id)->update([
            'title' => $input['title'] ?? $category->title,
            'icon' => array_key_exists('icon', $input) ? $input['icon'] : $category->icon,
            'image' => array_key_exists('image', $input) ? $input['image'] : $category->image,
            'sort_order' => $input['sort_order'] ?? $category->sort_order,
            'is_active' => (int) ($input['is_active'] ?? $category->is_active ? 1 : 0),
            'updated_at' => Dto::now(),
        ]);
        Dto::flush();
        $fresh = Dto::find('categories', $id);
        Dto::logActivity($admin->id, 'category.update', 'category', $id, "ویرایش دسته «{$fresh->title}»");
        return self::rawRow($fresh);
    }

    public static function adminDeleteCategory(object $admin, int $id): void
    {
        $category = Dto::find('categories', $id);
        if (!$category) {
            throw ApiException::notFound('دسته‌بندی یافت نشد');
        }
        if (Dto::rows('categories')->where('parent_id', $id)->count() > 0) {
            throw ApiException::unprocessable(['category' => ['ابتدا زیردسته‌های این دسته را حذف یا منتقل کنید']]);
        }
        if (Dto::rows('products')->contains(fn (object $p) => (int) $p->category_id === $id && $p->deleted_at === null)) {
            throw ApiException::unprocessable(['category' => ['این دسته دارای محصول است و قابل حذف نیست']]);
        }
        DB::table('categories')->where('id', $id)->delete();
        Dto::flush();
        Dto::logActivity($admin->id, 'category.delete', 'category', $id, "حذف دسته «{$category->title}»");
    }

    // ═══════════ برندها ═══════════
    public static function adminListBrands(): array
    {
        return Dto::rows('brands')->map(fn (object $b) => array_merge(self::rawRow($b), [
            'productsCount' => Dto::rows('products')->filter(
                fn (object $p) => (int) $p->brand_id === (int) $b->id && $p->deleted_at === null
            )->count(),
        ]))->values()->all();
    }

    public static function adminCreateBrand(object $admin, array $input): array
    {
        $id = (int) DB::table('brands')->max('id') + 1;
        DB::table('brands')->insert([
            'id' => $id,
            'title' => $input['title'],
            'slug' => "brand-{$id}",
            'logo' => $input['logo'] ?? null,
            'description' => null,
            'is_active' => 1,
            'meta_title' => $input['title'],
            'meta_description' => null,
            'created_at' => Dto::now(),
            'updated_at' => Dto::now(),
        ]);
        Dto::flush();
        Dto::logActivity($admin->id, 'brand.create', 'brand', $id, "ایجاد برند «{$input['title']}»");
        return self::rawRow(Dto::find('brands', $id));
    }

    public static function adminUpdateBrand(object $admin, int $id, array $input): array
    {
        $brand = Dto::find('brands', $id);
        if (!$brand) {
            throw ApiException::notFound('برند یافت نشد');
        }
        $patch = ['updated_at' => Dto::now()];
        if (!empty($input['title'])) {
            $patch['title'] = $input['title'];
        }
        if (array_key_exists('is_active', $input)) {
            $patch['is_active'] = $input['is_active'] ? 1 : 0;
        }
        if (array_key_exists('logo', $input)) {
            $patch['logo'] = $input['logo'];
        }
        DB::table('brands')->where('id', $id)->update($patch);
        Dto::flush();
        $fresh = Dto::find('brands', $id);
        Dto::logActivity($admin->id, 'brand.update', 'brand', $id, "ویرایش برند «{$fresh->title}»");
        return self::rawRow($fresh);
    }

    public static function adminDeleteBrand(object $admin, int $id): void
    {
        $brand = Dto::find('brands', $id);
        if (!$brand) {
            throw ApiException::notFound('برند یافت نشد');
        }
        if (Dto::rows('products')->contains(fn (object $p) => (int) $p->brand_id === $id && $p->deleted_at === null)) {
            throw ApiException::unprocessable(['brand' => ['این برند دارای محصول است؛ ابتدا محصولات را ویرایش کنید']]);
        }
        DB::table('brands')->where('id', $id)->delete();
        Dto::flush();
        Dto::logActivity($admin->id, 'brand.delete', 'brand', $id, "حذف برند «{$brand->title}»");
    }

    // ═══════════ کوپن‌ها ═══════════
    public static function adminListCoupons(): array
    {
        return Dto::rows('coupons')->sortByDesc('id')->map(fn (object $c) => Dto::couponDto($c))->values()->all();
    }

    public static function adminCreateCoupon(object $admin, array $input): array
    {
        $exists = Dto::rows('coupons')->contains(
            fn (object $c) => mb_strtolower($c->code) === mb_strtolower($input['code'])
        );
        if ($exists) {
            throw ApiException::unprocessable(['code' => ['این کد قبلاً استفاده شده است']]);
        }
        if ($input['type'] === 'percentage' && ((int) $input['value'] < 1 || (int) $input['value'] > 100)) {
            throw ApiException::unprocessable(['value' => ['درصد تخفیف باید بین ۱ تا ۱۰۰ باشد']]);
        }
        $id = (int) DB::table('coupons')->max('id') + 1;
        DB::table('coupons')->insert([
            'id' => $id,
            'code' => mb_strtoupper($input['code']),
            'type' => $input['type'],
            'value' => (int) $input['value'],
            'max_discount' => $input['max_discount'] ?? null,
            'min_order_amount' => $input['min_order_amount'] ?? null,
            'usage_limit' => $input['usage_limit'] ?? null,
            'used_count' => 0,
            'per_user_limit' => $input['per_user_limit'] ?? 1,
            'starts_at' => $input['starts_at'] ?? null,
            'expires_at' => $input['expires_at'] ?? null,
            'is_active' => (int) ($input['is_active'] ?? true ? 1 : 0),
            'applicable_categories' => isset($input['applicable_categories']) ? json_encode($input['applicable_categories'], JSON_UNESCAPED_UNICODE) : null,
            'applicable_products' => isset($input['applicable_products']) ? json_encode($input['applicable_products'], JSON_UNESCAPED_UNICODE) : null,
            'created_at' => Dto::now(),
            'updated_at' => Dto::now(),
        ]);
        Dto::flush();
        $coupon = Dto::find('coupons', $id);
        Dto::logActivity($admin->id, 'coupon.create', 'coupon', $id, "ایجاد کد تخفیف {$coupon->code}");
        return Dto::couponDto($coupon);
    }

    public static function adminUpdateCoupon(object $admin, int $id, array $input): array
    {
        $coupon = Dto::find('coupons', $id);
        if (!$coupon) {
            throw ApiException::notFound('کوپن یافت نشد');
        }
        if (!empty($input['code']) && mb_strtolower($input['code']) !== mb_strtolower($coupon->code)
            && Dto::rows('coupons')->contains(fn (object $c) => mb_strtolower($c->code) === mb_strtolower($input['code']))) {
            throw ApiException::unprocessable(['code' => ['این کد قبلاً استفاده شده است']]);
        }
        DB::table('coupons')->where('id', $id)->update([
            'code' => !empty($input['code']) ? mb_strtoupper($input['code']) : $coupon->code,
            'type' => $input['type'] ?? $coupon->type,
            'value' => $input['value'] ?? $coupon->value,
            'max_discount' => array_key_exists('max_discount', $input) ? $input['max_discount'] : $coupon->max_discount,
            'min_order_amount' => array_key_exists('min_order_amount', $input) ? $input['min_order_amount'] : $coupon->min_order_amount,
            'usage_limit' => array_key_exists('usage_limit', $input) ? $input['usage_limit'] : $coupon->usage_limit,
            'per_user_limit' => $input['per_user_limit'] ?? $coupon->per_user_limit,
            'starts_at' => array_key_exists('starts_at', $input) ? $input['starts_at'] : $coupon->starts_at,
            'expires_at' => array_key_exists('expires_at', $input) ? $input['expires_at'] : $coupon->expires_at,
            'is_active' => (int) ($input['is_active'] ?? $coupon->is_active ? 1 : 0),
            'updated_at' => Dto::now(),
        ]);
        Dto::flush();
        $fresh = Dto::find('coupons', $id);
        Dto::logActivity($admin->id, 'coupon.update', 'coupon', $id, "ویرایش کد تخفیف {$fresh->code}");
        return Dto::couponDto($fresh);
    }

    public static function adminDeleteCoupon(object $admin, int $id): void
    {
        $coupon = Dto::find('coupons', $id);
        if (!$coupon) {
            throw ApiException::notFound('کوپن یافت نشد');
        }
        DB::table('coupons')->where('id', $id)->delete();
        DB::table('carts')->where('coupon_id', $id)->update(['coupon_id' => null]);
        Dto::flush();
        Dto::logActivity($admin->id, 'coupon.delete', 'coupon', $id, "حذف کد تخفیف {$coupon->code}");
    }

    // ═══════════ پیشنهادهای ویژه ═══════════
    public static function adminListOffers(): array
    {
        return Dto::rows('special_offers')
            ->map(function (object $o) {
                $variant = Dto::find('product_variants', (int) $o->product_variant_id);
                $product = $variant ? Dto::find('products', (int) $variant->product_id) : null;
                return array_merge(self::rawRow($o), [
                    'productTitle' => $product?->title ?? '—',
                    'productId' => $product ? (int) $product->id : null,
                    'variantSku' => $variant?->sku ?? '—',
                ]);
            })
            ->sortByDesc('id')
            ->values()->all();
    }

    public static function adminCreateOffer(object $admin, array $input): array
    {
        $variant = Dto::find('product_variants', (int) $input['product_variant_id']);
        if (!$variant) {
            throw ApiException::unprocessable(['product_variant_id' => ['تنوع محصول یافت نشد']]);
        }
        if ((int) $input['discount_price'] >= (int) $variant->price) {
            throw ApiException::unprocessable(['discount_price' => ['قیمت پیشنهادی باید کمتر از قیمت اصلی باشد']]);
        }
        if (strtotime($input['expires_at']) <= strtotime($input['starts_at'])) {
            throw ApiException::unprocessable(['expires_at' => ['تاریخ پایان باید بعد از تاریخ شروع باشد']]);
        }
        $percentage = (int) round((((int) $variant->price - (int) $input['discount_price']) / (int) $variant->price) * 100);
        $type = $input['type'] ?? 'incredible_offers';
        $id = (int) DB::table('special_offers')->max('id') + 1;
        DB::table('special_offers')->insert([
            'id' => $id,
            'title' => $input['title'] ?? ($type === 'daily_deals' ? 'فروش روزانه' : 'پیشنهاد شگفت‌انگیز'),
            'type' => $type,
            'product_variant_id' => (int) $input['product_variant_id'],
            'discount_percentage' => $percentage,
            'discount_price' => (int) $input['discount_price'],
            'stock' => (int) $input['stock'],
            'sold_count' => 0,
            'starts_at' => $input['starts_at'],
            'expires_at' => $input['expires_at'],
            'is_active' => 1,
            'created_at' => Dto::now(),
            'updated_at' => Dto::now(),
        ]);
        Dto::flush();
        Dto::logActivity($admin->id, 'offer.create', 'special_offer', $id, "ایجاد پیشنهاد {$percentage}٪");
        return self::rawRow(Dto::find('special_offers', $id));
    }

    public static function adminUpdateOffer(object $admin, int $id, array $input): array
    {
        $offer = Dto::find('special_offers', $id);
        if (!$offer) {
            throw ApiException::notFound('پیشنهاد یافت نشد');
        }
        DB::table('special_offers')->where('id', $id)->update([
            'discount_price' => $input['discount_price'] ?? $offer->discount_price,
            'stock' => $input['stock'] ?? $offer->stock,
            'starts_at' => $input['starts_at'] ?? $offer->starts_at,
            'expires_at' => $input['expires_at'] ?? $offer->expires_at,
            'is_active' => (int) ($input['is_active'] ?? $offer->is_active ? 1 : 0),
            'updated_at' => Dto::now(),
        ]);
        Dto::flush();
        $fresh = Dto::find('special_offers', $id);
        $variant = Dto::find('product_variants', (int) $fresh->product_variant_id);
        if ($variant) {
            $percentage = max(1, (int) round((((int) $variant->price - (int) $fresh->discount_price) / (int) $variant->price) * 100));
            DB::table('special_offers')->where('id', $id)->update(['discount_percentage' => $percentage]);
            Dto::flush();
            $fresh = Dto::find('special_offers', $id);
        }
        Dto::logActivity($admin->id, 'offer.update', 'special_offer', $id, 'ویرایش پیشنهاد ویژه');
        return self::rawRow($fresh);
    }

    public static function adminDeleteOffer(object $admin, int $id): void
    {
        if (!Dto::find('special_offers', $id)) {
            throw ApiException::notFound('پیشنهاد یافت نشد');
        }
        DB::table('special_offers')->where('id', $id)->delete();
        Dto::flush();
        Dto::logActivity($admin->id, 'offer.delete', 'special_offer', $id, 'حذف پیشنهاد ویژه');
    }

    // ═══════════ دیدگاه‌ها (مدیریت) ═══════════
    public static function adminListReviews(array $filters): array
    {
        $list = Dto::rows('reviews');
        if (!empty($filters['status'])) {
            $list = $list->where('status', $filters['status']);
        }
        $list = $list->sortByDesc('created_at')->values();
        $page = $filters['page'];
        $perPage = $filters['perPage'];
        $items = $list->slice(($page - 1) * $perPage, $perPage)
            ->map(fn (object $r) => self::toReviewAdminRow($r))->values()->all();
        return ['items' => $items, 'total' => $list->count()];
    }

    public static function adminModerateReview(object $admin, int $id, string $status): array
    {
        $review = Dto::find('reviews', $id);
        if (!$review) {
            throw ApiException::notFound('دیدگاه یافت نشد');
        }
        DB::table('reviews')->where('id', $id)->update(['status' => $status, 'updated_at' => Dto::now()]);
        Dto::flush();
        $verb = $status === 'approved' ? 'تایید' : 'رد';
        Dto::logActivity($admin->id, "review.{$status}", 'review', $id, "{$verb} دیدگاه «{$review->title}»");
        return self::toReviewAdminRow(Dto::find('reviews', $id));
    }

    public static function adminDeleteReview(object $admin, int $id): void
    {
        if (!Dto::find('reviews', $id)) {
            throw ApiException::notFound('دیدگاه یافت نشد');
        }
        DB::table('reviews')->where('id', $id)->delete();
        Dto::flush();
        Dto::logActivity($admin->id, 'review.delete', 'review', $id, 'حذف دیدگاه');
    }

    // ═══════════ بنرها ═══════════
    public static function adminListBanners(): array
    {
        return Dto::rows('banners')
            ->sortBy('sort_order')
            ->map(fn (object $b) => self::toUserishBanner($b))
            ->values()->all();
    }

    public static function adminCreateBanner(object $admin, array $input): array
    {
        $id = (int) DB::table('banners')->max('id') + 1;
        DB::table('banners')->insert([
            'id' => $id,
            'title' => $input['title'],
            'image' => $input['image'],
            'link' => $input['link'] ?? null,
            'position' => $input['position'],
            'sort_order' => $input['sort_order'] ?? 99,
            'starts_at' => null,
            'expires_at' => null,
            'is_active' => 1,
            'created_at' => Dto::now(),
            'updated_at' => Dto::now(),
        ]);
        Dto::flush();
        Dto::logActivity($admin->id, 'banner.create', 'banner', $id, "ایجاد بنر «{$input['title']}»");
        return self::toUserishBanner(Dto::find('banners', $id));
    }

    public static function adminUpdateBanner(object $admin, int $id, array $input): array
    {
        $banner = Dto::find('banners', $id);
        if (!$banner) {
            throw ApiException::notFound('بنر یافت نشد');
        }
        DB::table('banners')->where('id', $id)->update([
            'title' => $input['title'] ?? $banner->title,
            'image' => $input['image'] ?? $banner->image,
            'link' => array_key_exists('link', $input) ? $input['link'] : $banner->link,
            'position' => $input['position'] ?? $banner->position,
            'sort_order' => $input['sort_order'] ?? $banner->sort_order,
            'is_active' => (int) ($input['is_active'] ?? $banner->is_active ? 1 : 0),
            'updated_at' => Dto::now(),
        ]);
        Dto::flush();
        $fresh = Dto::find('banners', $id);
        Dto::logActivity($admin->id, 'banner.update', 'banner', $id, "ویرایش بنر «{$fresh->title}»");
        return self::toUserishBanner($fresh);
    }

    public static function adminDeleteBanner(object $admin, int $id): void
    {
        if (!Dto::find('banners', $id)) {
            throw ApiException::notFound('بنر یافت نشد');
        }
        DB::table('banners')->where('id', $id)->delete();
        Dto::flush();
        Dto::logActivity($admin->id, 'banner.delete', 'banner', $id, 'حذف بنر');
    }

    // ═══════════ فروشندگان (مدیریت) ═══════════
    public static function adminListSellers(): array
    {
        return Dto::rows('sellers')
            ->map(fn (object $s) => array_merge(Dto::sellerDto($s), [
                'productsCount' => Dto::rows('products')->filter(
                    fn (object $p) => (int) $p->seller_id === (int) $s->id && $p->deleted_at === null
                )->count(),
            ]))
            ->sortBy('id')
            ->values()->all();
    }

    public static function adminSetSellerStatus(object $admin, int $id, string $status, ?string $reason = null): array
    {
        $seller = Dto::find('sellers', $id);
        if (!$seller) {
            throw ApiException::notFound('فروشنده یافت نشد');
        }
        DB::table('sellers')->where('id', $id)->update(['status' => $status, 'updated_at' => Dto::now()]);

        $owner = Dto::find('users', (int) $seller->user_id);
        if ($owner && !in_array($owner->role, ['admin', 'super_admin'], true)) {
            DB::table('users')->where('id', $owner->id)->update([
                'role' => $status === 'approved' ? 'seller' : 'customer',
            ]);
        }
        if ($owner) {
            $reasonPart = ($reason !== null && $reason !== '') ? ' دلیل: ' . $reason : '';
            $messages = [
                'approved' => "فروشگاه «{$seller->shop_name}» شما تایید شد؛ اکنون می‌توانید محصول ثبت کنید.",
                'rejected' => "درخواست فروشندگی «{$seller->shop_name}» رد شد.{$reasonPart}",
                'suspended' => "فروشگاه «{$seller->shop_name}» شما به‌صورت موقت معلق شد.{$reasonPart}",
                'pending' => 'درخواست فروشندگی شما در حال بررسی است.',
            ];
            Dto::notify((int) $owner->id, 'system', 'وضعیت فروشگاه شما', $messages[$status] ?? $messages['pending']);
        }
        Dto::flush();
        Dto::logActivity($admin->id, "seller.{$status}", 'seller', $id, "{$status} فروشگاه «{$seller->shop_name}»");
        return Dto::sellerDto(Dto::find('sellers', $id));
    }
}
