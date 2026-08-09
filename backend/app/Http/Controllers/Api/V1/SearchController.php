<?php

namespace App\Http\Controllers\Api\V1;

use App\Support\ApiResponder;
use App\Support\Dto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SearchController
{
    /** جستجوی کامل — همان موتور فیلتر محصولات + ثبت لاگ */
    public function search(Request $request): JsonResponse
    {
        $q = trim((string) $request->query('q', ''));
        $sort = (string) $request->query('sort', 'most_relevant');
        $page = max(1, ApiResponder::intParam($request->query('page'), 1));
        $perPage = min(48, max(1, ApiResponder::intParam($request->query('per_page'), 12)));

        $result = Dto::queryProducts(['q' => $q, 'sort' => $sort, 'page' => $page, 'perPage' => $perPage]);

        if (mb_strlen($q) >= 2) {
            DB::table('search_logs')->insert([
                'user_id' => null, 'query' => $q, 'results_count' => $result['total'], 'created_at' => Dto::now(),
            ]);
            Dto::flush();
        }
        return ApiResponder::page($result['items'], $result['total'], $page, $perPage);
    }

    /** پیشنهاد جستجو (مثل دیجی‌کالا) — محصول/دسته/برند مرتبط با عبارت */
    public function suggest(Request $request): JsonResponse
    {
        $q = trim((string) $request->query('q', ''));
        $data = ['query' => $q, 'products' => [], 'categories' => [], 'brands' => []];
        if (mb_strlen($q) >= 2) {
            $needle = mb_strtolower($q);
            $data['products'] = Dto::queryProducts(['q' => $q, 'page' => 1, 'perPage' => 4])['items'];
            $data['categories'] = Dto::rows('categories')->where('is_active', 1)
                ->filter(fn (object $c) => str_contains(mb_strtolower($c->title), $needle))
                ->take(4)->map(fn (object $c) => ['id' => $c->id, 'title' => $c->title, 'slug' => $c->slug])->values()->all();
            $data['brands'] = Dto::rows('brands')->where('is_active', 1)
                ->filter(fn (object $b) => str_contains(mb_strtolower($b->title . ' ' . $b->slug), $needle))
                ->take(4)->map(fn (object $b) => ['id' => $b->id, 'title' => $b->title, 'slug' => $b->slug])->values()->all();
        }
        return ApiResponder::ok($data);
    }

    /** پرس‌وجوهای پرتکرار — لاگ واقعی + کلمات پرطرفدار پیش‌فرض */
    public function popular(): JsonResponse
    {
        $curated = [
            ['query' => 'آیفون', 'hits' => 980], ['query' => 'پلی استیشن 5', 'hits' => 860],
            ['query' => 'هدفون سونی', 'hits' => 720], ['query' => 'لپ تاپ گیمینگ', 'hits' => 640],
            ['query' => 'کتاب', 'hits' => 510], ['query' => 'ساعت هوشمند', 'hits' => 430],
        ];
        $counts = [];
        foreach (Dto::rows('search_logs') as $log) {
            $counts[$log->query] = ($counts[$log->query] ?? 0) + 1;
        }
        arsort($counts);
        $merged = [];
        foreach (array_slice($counts, 0, 5, true) as $query => $hits) {
            $merged[] = ['query' => $query, 'hits' => $hits];
        }
        foreach ($curated as $c) {
            $exists = false;
            foreach ($merged as $m) {
                if ($m['query'] === $c['query']) { $exists = true; break; }
            }
            if (!$exists) $merged[] = $c;
        }
        return ApiResponder::ok(array_slice($merged, 0, 8));
    }
}
