<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\QuestionCreateRequest;
use App\Http\Requests\ReviewCreateRequest;
use App\Support\ApiException;
use App\Support\ApiResponder;
use App\Support\Dto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * کاتالوگ عمومی — خانه، دسته‌ها، محصولات، دیدگاه‌ها، پرسش‌ها و پیشنهادها.
 */
class CatalogController
{
    /** @return array<int, array> */
    private function activeOffers(string $type): array
    {
        $now = time();
        return Dto::rows('special_offers')
            ->where('type', $type)->where('is_active', 1)
            ->filter(fn (object $o) => strtotime((string) $o->starts_at) <= $now && $now <= strtotime((string) $o->expires_at))
            ->map(fn (object $o) => Dto::offerDto($o))->filter()->values()->all();
    }

    /** @return array<int, array> */
    private function banners(string $position): array
    {
        $now = time();
        return Dto::rows('banners')
            ->where('position', $position)->where('is_active', 1)
            ->filter(fn (object $b) => (!$b->starts_at || strtotime((string) $b->starts_at) <= $now) && (!$b->expires_at || strtotime((string) $b->expires_at) >= $now))
            ->sortBy('sort_order')
            ->map(fn (object $b) => Dto::bannerDto($b))->values()->all();
    }

    public function home(): JsonResponse
    {
        $active = Dto::rows('products')->where('status', 'active')->whereNull('deleted_at')->values();
        $offers = $this->activeOffers('incredible_offers');

        $featured = $active->where('is_featured', 1)->take(8)->map(fn (object $p) => Dto::productCardDto($p))->values()->all();
        $bestSelling = $active->sort(fn (object $a, object $b) => Dto::soldScoreOf((int) $b->id) <=> Dto::soldScoreOf((int) $a->id))
            ->take(8)->map(fn (object $p) => Dto::productCardDto($p))->values()->all();
        $newest = $active->sortByDesc('created_at')->take(8)->map(fn (object $p) => Dto::productCardDto($p))->values()->all();

        return ApiResponder::ok([
            'heroBanners' => $this->banners('hero'),
            'sidebarBanners' => $this->banners('sidebar'),
            'incredibleOffers' => $offers,
            'incredibleEndsAt' => $offers[0]['expiresAt'] ?? null,
            'categories' => Dto::categoryTreeDto(),
            'featuredProducts' => $featured,
            'bestSellingProducts' => $bestSelling,
            'newestProducts' => $newest,
            'brands' => Dto::rows('brands')->where('is_active', 1)
                ->map(fn (object $b) => ['id' => $b->id, 'title' => $b->title, 'slug' => $b->slug, 'logo' => $b->logo])->values()->all(),
        ]);
    }

    public function categories(): JsonResponse
    {
        return ApiResponder::ok(Dto::categoryTreeDto());
    }

    private function findCategory(string $slug): object
    {
        $category = Dto::rows('categories')->firstWhere('slug', $slug);
        if (!$category) throw ApiException::notFound('دسته‌بندی مورد نظر یافت نشد');
        return $category;
    }

    public function category(string $slug): JsonResponse
    {
        $category = $this->findCategory($slug);
        $breadcrumb = [];
        $cursor = $category;
        $guard = 0;
        while ($cursor && $guard++ < 50) {
            array_unshift($breadcrumb, ['id' => $cursor->id, 'title' => $cursor->title, 'slug' => $cursor->slug]);
            $cursor = $cursor->parent_id !== null ? Dto::find('categories', (int) $cursor->parent_id) : null;
        }
        return ApiResponder::ok([
            'category' => [
                'id' => $category->id, 'title' => $category->title, 'slug' => $category->slug,
                'icon' => $category->icon, 'image' => $category->image,
                'children' => Dto::categoryTreeDto((int) $category->id),
            ],
            'breadcrumb' => $breadcrumb,
            'filters' => Dto::buildCategoryFilters($slug),
        ]);
    }

    /** @return array<string, mixed> پارامترهای مشترک لیست محصولات */
    private function productParams(Request $request): array
    {
        $sorts = ['most_relevant', 'best_selling', 'most_viewed', 'highest_rated', 'newest', 'price_asc', 'price_desc', 'highest_discount'];
        $sort = $request->query('sort', 'most_relevant');
        $csv = fn (?string $v) => $v ? array_values(array_filter(array_map('trim', explode(',', $v)))) : [];
        $csvNumbers = fn (?string $v) => array_values(array_filter(array_map('intval', $csv($v)), fn (int $n) => $n > 0));
        return [
            'categorySlug' => $request->query('category') ?: null,
            'brandSlugs' => $csv($request->query('brands')),
            'colorIds' => $csvNumbers($request->query('colors')),
            'attributeValueIds' => $csvNumbers($request->query('attrs')),
            'q' => $request->query('q') ?: null,
            'minPrice' => $request->query('min_price') !== null ? ApiResponder::intParam($request->query('min_price'), 0) : null,
            'maxPrice' => $request->query('max_price') !== null ? ApiResponder::intParam($request->query('max_price'), 0) : null,
            'inStock' => $request->query('in_stock') === '1',
            'hasDiscount' => $request->query('has_discount') === '1',
            'sort' => in_array($sort, $sorts, true) ? $sort : 'most_relevant',
            'page' => max(1, ApiResponder::intParam($request->query('page'), 1)),
            'perPage' => min(48, max(1, ApiResponder::intParam($request->query('per_page'), 12))),
        ];
    }

    public function products(Request $request): JsonResponse
    {
        $params = $this->productParams($request);
        $result = Dto::queryProducts($params);
        $body = [
            'data' => $result['items'],
            'meta' => json_decode(ApiResponder::page([], $result['total'], $params['page'], $params['perPage'])->content(), true)['meta'],
        ];
        if ($request->query('with_filters') === '1') {
            $body['filters'] = Dto::buildCategoryFilters($params['categorySlug'], $params['q']);
        }
        return response()->json($body);
    }

    public function categoryProducts(string $slug, Request $request): JsonResponse
    {
        $this->findCategory($slug);
        $params = $this->productParams($request);
        $params['categorySlug'] = $slug;
        $result = Dto::queryProducts($params);
        return ApiResponder::page($result['items'], $result['total'], $params['page'], $params['perPage']);
    }

    public function categoryFilters(string $slug): JsonResponse
    {
        $this->findCategory($slug);
        return ApiResponder::ok(Dto::buildCategoryFilters($slug));
    }

    public function categoryBrands(string $slug): JsonResponse
    {
        $this->findCategory($slug);
        return ApiResponder::ok(Dto::buildCategoryFilters($slug)['brands']);
    }

    public function brands(): JsonResponse
    {
        return ApiResponder::ok(
            Dto::rows('brands')->where('is_active', 1)
                ->map(fn (object $b) => ['id' => $b->id, 'title' => $b->title, 'slug' => $b->slug, 'logo' => $b->logo])->values()->all(),
        );
    }

    private function findProduct(string $param): object
    {
        $product = Dto::rows('products')->first(
            fn (object $p) => ($p->slug === $param || (ctype_digit($param) && (int) $p->id === (int) $param))
                && $p->status === 'active' && !$p->deleted_at,
        );
        if (!$product) throw ApiException::notFound('محصول مورد نظر یافت نشد');
        return $product;
    }

    public function product(string $slug): JsonResponse
    {
        $product = $this->findProduct($slug);
        DB::table('products')->where('id', $product->id)->increment('view_count', 1, ['updated_at' => Dto::now()]);
        Dto::flush();
        return ApiResponder::ok(Dto::productDetailDto(Dto::find('products', (int) $product->id)));
    }

    public function similar(string $slug): JsonResponse
    {
        return ApiResponder::ok(Dto::relatedProducts($this->findProduct($slug)));
    }

    public function priceChart(string $slug): JsonResponse
    {
        $product = $this->findProduct($slug);
        $rows = Dto::rows('product_variants')->where('product_id', $product->id)->where('is_active', 1)
            ->map(fn (object $v) => [
                'variantId' => $v->id,
                'sku' => $v->sku,
                'currentPrice' => (int) ($v->sale_price ?? $v->price),
                'points' => Dto::rows('product_price_history')->where('product_variant_id', $v->id)
                    ->sortBy('created_at')
                    ->map(fn (object $h) => ['date' => $h->created_at, 'price' => (int) $h->new_price])->values()->all(),
            ])->values()->all();
        return ApiResponder::ok($rows);
    }

    public function reviews(string $slug, Request $request): JsonResponse
    {
        $product = $this->findProduct($slug);
        $page = max(1, ApiResponder::intParam($request->query('page'), 1));
        $perPage = min(20, max(1, ApiResponder::intParam($request->query('per_page'), 10)));
        $all = Dto::rows('reviews')->where('product_id', $product->id)->where('status', 'approved')
            ->sortByDesc('likes_count')->values();
        $items = $all->slice(($page - 1) * $perPage, $perPage)->map(fn (object $r) => Dto::reviewDto($r))->values()->all();
        return ApiResponder::page($items, $all->count(), $page, $perPage);
    }

    public function storeReview(ReviewCreateRequest $request, string $slug): JsonResponse
    {
        $user = $request->attributes->get('gnk_user');
        $product = $this->findProduct($slug);
        $input = $request->validated();

        $variantIds = Dto::rows('product_variants')->where('product_id', $product->id)->pluck('id');
        $isBuyer = Dto::rows('order_items')->contains(function (object $i) use ($variantIds, $user) {
            if (!$variantIds->contains($i->product_variant_id)) return false;
            $order = Dto::find('orders', (int) $i->order_id);
            return $order && (int) $order->user_id === (int) $user->id && $order->status === 'delivered';
        });

        $id = DB::table('reviews')->insertGetId([
            'product_id' => $product->id, 'user_id' => $user->id, 'order_item_id' => null,
            'title' => $input['title'], 'body' => $input['body'], 'rating' => $input['rating'],
            'pros' => json_encode(array_values($input['pros'] ?? []), JSON_UNESCAPED_UNICODE),
            'cons' => json_encode(array_values($input['cons'] ?? []), JSON_UNESCAPED_UNICODE),
            'is_buyer' => $isBuyer ? 1 : 0, 'status' => 'pending',
            'likes_count' => 0, 'dislikes_count' => 0,
            'created_at' => Dto::now(), 'updated_at' => Dto::now(),
        ]);
        Dto::flush();
        Dto::logActivity((int) $user->id, 'review.create', 'product', (int) $product->id, "ثبت دیدگاه برای محصول {$product->id}");
        return ApiResponder::ok(Dto::reviewDto(Dto::find('reviews', $id)), 201);
    }

    public function questions(string $slug, Request $request): JsonResponse
    {
        $product = $this->findProduct($slug);
        $items = Dto::rows('product_questions')->where('product_id', $product->id)->where('status', '!=', 'rejected')
            ->sortByDesc('created_at')->map(fn (object $q) => Dto::questionDto($q))->values()->all();
        return ApiResponder::ok($items);
    }

    public function storeQuestion(QuestionCreateRequest $request, string $slug): JsonResponse
    {
        $user = $request->attributes->get('gnk_user');
        $product = $this->findProduct($slug);
        $id = DB::table('product_questions')->insertGetId([
            'product_id' => $product->id, 'user_id' => $user->id,
            'question' => $request->validated()['question'],
            'answer' => null, 'answered_by' => null, 'answered_at' => null,
            'status' => 'pending', 'created_at' => Dto::now(), 'updated_at' => Dto::now(),
        ]);
        Dto::flush();
        return ApiResponder::ok(Dto::questionDto(Dto::find('product_questions', $id)), 201);
    }

    public function notifyAvailability(string $slug, Request $request): JsonResponse
    {
        $product = $this->findProduct($slug);
        $user = $request->attributes->get('gnk_user');
        $phone = trim((string) $request->input('phone', '')) ?: null;
        if (!$user && !$phone) {
            throw ApiException::unprocessable(['identity' => ['برای اطلاع از موجودی، وارد شوید یا شماره موبایل وارد کنید']]);
        }
        $variantId = $request->input('variant_id');
        $variants = Dto::rows('product_variants')->where('product_id', $product->id)->where('is_active', 1)->values();
        $variant = $variantId
            ? $variants->firstWhere('id', $variantId)
            : ($variants->firstWhere('stock', 0) ?? $variants->first());
        if (!$variant) {
            throw ApiException::unprocessable(['variant' => ['تنوع معتبر نیست']]);
        }
        if ((int) $variant->stock > 0) {
            throw ApiException::unprocessable(['variant' => ['این کالا هم‌اکنون موجود است']]);
        }
        $duplicate = Dto::rows('stock_alerts')->contains(
            fn (object $a) => (int) $a->product_variant_id === (int) $variant->id
                && ($user ? (int) $a->user_id === (int) $user->id : $a->phone === $phone),
        );
        if ($duplicate) {
            return ApiResponder::ok(['subscribed' => true, 'already' => true, 'message' => 'قبلاً برای این کالا ثبت‌نام کرده‌اید']);
        }
        DB::table('stock_alerts')->insert([
            'user_id' => $user?->id, 'phone' => $phone,
            'product_variant_id' => $variant->id, 'created_at' => Dto::now(),
        ]);
        Dto::flush();
        return ApiResponder::ok(['subscribed' => true, 'message' => 'به محض موجود شدن به شما اطلاع‌رسانی می‌کنیم'], 201);
    }

    public function offers(Request $request): JsonResponse
    {
        $type = $request->query('type') === 'daily_deals' ? 'daily_deals' : 'incredible_offers';
        $offers = $this->activeOffers($type);
        return ApiResponder::ok(['offers' => $offers, 'endsAt' => $offers[0]['expiresAt'] ?? null]);
    }
}
