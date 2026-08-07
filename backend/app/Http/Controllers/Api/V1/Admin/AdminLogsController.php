<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Support\ApiResponder;
use App\Support\Dto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminLogsController
{
    public function index(Request $request): JsonResponse
    {
        $page = max(1, ApiResponder::intParam($request->query('page'), 1));
        $perPage = min(100, max(1, ApiResponder::intParam($request->query('per_page'), 30)));
        $list = Dto::rows('activity_logs')->sortByDesc('id')->values();
        $items = $list->slice(($page - 1) * $perPage, $perPage)
            ->map(fn (object $l) => Dto::activityLogDto($l))->values()->all();
        return ApiResponder::page($items, $list->count(), $page, $perPage);
    }
}
