<?php

namespace App\Http\Controllers\Api\V1;

use App\Services\CartService;
use App\Support\ApiException;
use App\Support\ApiResponder;
use App\Support\Dto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * تعامل کاربر — علاقه‌مندی‌ها، لیست مقایسه (مهمان/کاربر) و اعلان‌ها.
 */
class EngagementController
{
    // ─── علاقه‌مندی ───
    public function wishlist(Request $request): JsonResponse
    {
        $user = $request->attributes->get('gnk_user');
        $items = Dto::rows('wishlists')->where('user_id', $user->id)->sortByDesc('created_at')
            ->map(function (object $w) {
                $product = Dto::rows('products')->first(fn (object $p) => (int) $p->id === (int) $w->product_id && $p->status === 'active' && !$p->deleted_at);
                return $product ? Dto::productCardDto($product) : null;
            })->filter()->values()->all();
        return ApiResponder::ok($items);
    }

    public function wishlistAdd(Request $request, int $productId): JsonResponse
    {
        $user = $request->attributes->get('gnk_user');
        $product = Dto::rows('products')->first(fn (object $p) => (int) $p->id === $productId && $p->status === 'active' && !$p->deleted_at);
        if (!$product) throw ApiException::notFound('محصول مورد نظر یافت نشد');
        $exists = Dto::rows('wishlists')->where('user_id', $user->id)->where('product_id', $product->id)->isNotEmpty();
        if (!$exists) {
            DB::table('wishlists')->insert([
                'user_id' => $user->id, 'product_id' => $product->id,
                'created_at' => Dto::now(), 'updated_at' => Dto::now(),
            ]);
            Dto::flush();
        }
        return ApiResponder::ok([
            'added' => true,
            'count' => Dto::rows('wishlists')->where('user_id', $user->id)->count(),
        ], 201);
    }

    public function wishlistRemove(Request $request, int $productId): JsonResponse
    {
        $user = $request->attributes->get('gnk_user');
        DB::table('wishlists')->where('user_id', $user->id)->where('product_id', $productId)->delete();
        Dto::flush();
        return ApiResponder::ok([
            'added' => false,
            'count' => Dto::rows('wishlists')->where('user_id', $user->id)->count(),
        ]);
    }

    // ─── مقایسه ───
    /** @return array<int, object> */
    private function ownerLists(Request $request): array
    {
        $owner = CartService::owner($request);
        return Dto::rows('compare_lists')
            ->filter(fn (object $l) => $owner['userId'] ? (int) $l->user_id === $owner['userId'] : $l->session_id === $owner['sessionId'])
            ->values()->all();
    }

    private function compareDto(Request $request): array
    {
        $list = $this->ownerLists($request)[0] ?? null;
        if (!$list) return ['category' => null, 'products' => []];
        $products = Dto::rows('compare_list_items')->where('compare_list_id', $list->id)
            ->map(function (object $i) {
                $product = Dto::rows('products')->first(fn (object $p) => (int) $p->id === (int) $i->product_id && $p->status === 'active');
                return $product ? Dto::productDetailDto($product) : null;
            })->filter()->values()->all();
        return ['category' => Dto::categoryMiniOf((int) $list->category_id), 'products' => $products];
    }

    public function compareGet(Request $request): JsonResponse
    {
        return ApiResponder::ok($this->compareDto($request));
    }

    public function compareAdd(Request $request, int $productId): JsonResponse
    {
        $product = Dto::rows('products')->first(fn (object $p) => (int) $p->id === $productId && $p->status === 'active' && !$p->deleted_at);
        if (!$product) throw ApiException::notFound('محصول مورد نظر یافت نشد');
        $owner = CartService::owner($request);
        $lists = $this->ownerLists($request);
        $list = null;
        foreach ($lists as $l) {
            if ((int) $l->category_id === (int) $product->category_id) $list = $l;
        }
        if (!$list && count($lists) > 0) {
            throw ApiException::unprocessable(['product' => ['مقایسه فقط برای کالاهای یک دسته‌بندی ممکن است؛ ابتدا لیست قبلی را خالی کنید']]);
        }
        if (!$list) {
            $listId = DB::table('compare_lists')->insertGetId([
                'user_id' => $owner['userId'], 'session_id' => $owner['sessionId'],
                'category_id' => $product->category_id, 'created_at' => Dto::now(), 'updated_at' => Dto::now(),
            ]);
            Dto::flush();
            $list = Dto::find('compare_lists', $listId);
        }
        $already = Dto::rows('compare_list_items')->where('compare_list_id', $list->id)->where('product_id', $product->id)->isNotEmpty();
        if (!$already) {
            $count = Dto::rows('compare_list_items')->where('compare_list_id', $list->id)->count();
            if ($count >= 4) {
                throw ApiException::unprocessable(['product' => ['حداکثر ۴ کالا قابل مقایسه است']]);
            }
            DB::table('compare_list_items')->insert([
                'compare_list_id' => $list->id, 'product_id' => $product->id,
                'created_at' => Dto::now(), 'updated_at' => Dto::now(),
            ]);
            Dto::flush();
        }
        return ApiResponder::ok($this->compareDto($request), 201);
    }

    public function compareRemove(Request $request, int $productId): JsonResponse
    {
        $lists = $this->ownerLists($request);
        foreach ($lists as $list) {
            DB::table('compare_list_items')->where('compare_list_id', $list->id)->where('product_id', $productId)->delete();
        }
        Dto::flush();
        return ApiResponder::ok($this->compareDto($request));
    }

    // ─── اعلان‌ها ───
    public function notifications(Request $request): JsonResponse
    {
        $user = $request->attributes->get('gnk_user');
        $page = max(1, ApiResponder::intParam($request->query('page'), 1));
        $perPage = min(30, max(1, ApiResponder::intParam($request->query('per_page'), 15)));
        $onlyUnread = $request->query('unread') === '1';

        $list = Dto::rows('notifications')->where('user_id', $user->id);
        if ($onlyUnread) $list = $list->whereNull('read_at');
        $list = $list->sortByDesc('created_at')->values();

        $unreadCount = Dto::rows('notifications')->where('user_id', $user->id)->whereNull('read_at')->count();
        $items = $list->slice(($page - 1) * $perPage, $perPage)->map(fn (object $n) => Dto::notificationDto($n))->values()->all();
        $response = ApiResponder::page($items, $list->count(), $page, $perPage);
        $response->headers->set('x-unread-count', (string) $unreadCount);
        return $response;
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $count = Dto::rows('notifications')->where('user_id', $request->attributes->get('gnk_user')->id)->whereNull('read_at')->count();
        return ApiResponder::ok(['count' => $count]);
    }

    public function readAll(Request $request): JsonResponse
    {
        $updated = DB::table('notifications')->where('user_id', $request->attributes->get('gnk_user')->id)->whereNull('read_at')
            ->update(['read_at' => Dto::now(), 'updated_at' => Dto::now()]);
        Dto::flush();
        return ApiResponder::ok(['updated' => $updated]);
    }

    public function read(Request $request, int $id): JsonResponse
    {
        $notification = Dto::rows('notifications')->first(fn (object $n) => (int) $n->id === $id && (int) $n->user_id === (int) $request->attributes->get('gnk_user')->id);
        if (!$notification) throw ApiException::notFound('اعلان مورد نظر یافت نشد');
        if (!$notification->read_at) {
            DB::table('notifications')->where('id', $id)->update(['read_at' => Dto::now(), 'updated_at' => Dto::now()]);
            Dto::flush();
        }
        return ApiResponder::ok(['read' => true]);
    }
}
