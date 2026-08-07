<?php

namespace App\Http\Controllers\Api\V1;

use App\Support\ApiException;
use App\Support\ApiResponder;
use App\Support\Dto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * محتوای عمومی — بنر، اسلایدر، منو، سوالات متداول، صفحات، بلاگ، جغرافیا و روش‌های ارسال.
 * خروجی چند مسیر (raw) دقیقاً معادل ردیف‌های دیتابیس است تا قرارداد فعلی حفظ شود.
 */
class ContentController
{
    /** دیکد ستون‌های json و تبدیل فلگ‌ها — برای خروجی raw یکسان با نسخه فعلی */
    private function raw(object $row, array $jsonFields = [], array $boolFields = []): array
    {
        $arr = (array) $row;
        foreach ($jsonFields as $f) {
            $arr[$f] = isset($arr[$f]) && is_string($arr[$f]) ? Dto::js($arr[$f]) : ($arr[$f] ?? []);
        }
        foreach ($boolFields as $f) {
            if (isset($arr[$f])) $arr[$f] = (bool) $arr[$f];
        }
        return $arr;
    }

    public function banners(Request $request): JsonResponse
    {
        $now = time();
        $list = Dto::rows('banners')->where('is_active', 1)
            ->filter(fn (object $b) => (!$b->starts_at || strtotime((string) $b->starts_at) <= $now) && (!$b->expires_at || strtotime((string) $b->expires_at) >= $now))
            ->sortBy('sort_order');
        if ($position = $request->query('position')) {
            $list = $list->where('position', $position);
        }
        return ApiResponder::ok($list->map(fn (object $b) => Dto::bannerDto($b))->values()->all());
    }

    public function sliders(): JsonResponse
    {
        $items = Dto::rows('sliders')->where('is_active', 1)
            ->map(fn (object $s) => $this->raw($s, ['items'], ['is_active']))->values()->all();
        return ApiResponder::ok($items);
    }

    public function menus(Request $request): JsonResponse
    {
        $list = Dto::rows('menus')->where('is_active', 1);
        if ($location = $request->query('location')) {
            $list = $list->where('location', $location);
        }
        return ApiResponder::ok($list->map(fn (object $m) => $this->raw($m, ['items'], ['is_active']))->values()->all());
    }

    public function faqs(): JsonResponse
    {
        $items = Dto::rows('faqs')->where('is_active', 1)->sortBy('sort_order')
            ->map(fn (object $f) => $this->raw($f, [], ['is_active']))->values()->all();
        return ApiResponder::ok($items);
    }

    public function page(string $slug): JsonResponse
    {
        $page = Dto::rows('pages')->first(fn (object $p) => $p->slug === $slug && $p->status === 'published');
        if (!$page) throw ApiException::notFound('صفحه مورد نظر یافت نشد');
        return ApiResponder::ok($this->raw($page));
    }

    public function blog(): JsonResponse
    {
        Dto::flush();
        $items = Dto::rows('blog_posts')->where('status', 'published')->whereNull('deleted_at')
            ->sortByDesc('published_at')
            ->map(fn (object $p) => Dto::blogDto($p))->values()->all();
        return ApiResponder::ok($items);
    }

    public function blogShow(string $slug): JsonResponse
    {
        $post = Dto::rows('blog_posts')->first(fn (object $p) => $p->slug === $slug && $p->status === 'published' && !$p->deleted_at);
        if (!$post) throw ApiException::notFound('مقاله مورد نظر یافت نشد');
        DB::table('blog_posts')->where('id', $post->id)->increment('view_count');
        Dto::flush();
        return ApiResponder::ok(Dto::blogDto(Dto::find('blog_posts', (int) $post->id), true));
    }

    public function provinces(): JsonResponse
    {
        return ApiResponder::ok(Dto::rows('provinces')->map(fn (object $p) => $this->raw($p))->values()->all());
    }

    public function cities(int $provinceId): JsonResponse
    {
        return ApiResponder::ok(
            Dto::rows('cities')->where('province_id', $provinceId)->map(fn (object $c) => $this->raw($c))->values()->all(),
        );
    }

    public function shippingMethods(): JsonResponse
    {
        return ApiResponder::ok(
            Dto::rows('shipping_methods')->where('is_active', 1)->map(fn (object $m) => $this->raw($m, [], ['is_active']))->values()->all(),
        );
    }
}
