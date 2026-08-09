<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Requests\AdminBannerCreateRequest;
use App\Http\Requests\AdminReviewModerateRequest;
use App\Services\AdminCatalogService;
use App\Support\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** بنرها و مدیریت دیدگاه‌ها */
class AdminEngagementController
{
    // ─── بنرها ───
    public function banners(): JsonResponse
    {
        return ApiResponder::ok(AdminCatalogService::adminListBanners());
    }

    public function storeBanner(AdminBannerCreateRequest $request): JsonResponse
    {
        $admin = $request->attributes->get('gnk_user');
        return ApiResponder::ok(AdminCatalogService::adminCreateBanner($admin, $request->validated()), 201);
    }

    public function updateBanner(Request $request, int $id): JsonResponse
    {
        $admin = $request->attributes->get('gnk_user');
        return ApiResponder::ok(AdminCatalogService::adminUpdateBanner($admin, $id, $request->all()));
    }

    public function destroyBanner(Request $request, int $id): JsonResponse
    {
        $admin = $request->attributes->get('gnk_user');
        AdminCatalogService::adminDeleteBanner($admin, $id);
        return ApiResponder::ok(['deleted' => true, 'message' => 'بنر حذف شد']);
    }

    // ─── دیدگاه‌ها ───
    public function reviews(Request $request): JsonResponse
    {
        $page = max(1, ApiResponder::intParam($request->query('page'), 1));
        $perPage = min(50, max(1, ApiResponder::intParam($request->query('per_page'), 15)));
        $result = AdminCatalogService::adminListReviews([
            'status' => $request->query('status'),
            'page' => $page,
            'perPage' => $perPage,
        ]);
        return ApiResponder::page($result['items'], $result['total'], $page, $perPage);
    }

    public function moderateReview(AdminReviewModerateRequest $request, int $id): JsonResponse
    {
        $admin = $request->attributes->get('gnk_user');
        return ApiResponder::ok(AdminCatalogService::adminModerateReview($admin, $id, $request->validated()['status']));
    }

    public function destroyReview(Request $request, int $id): JsonResponse
    {
        $admin = $request->attributes->get('gnk_user');
        AdminCatalogService::adminDeleteReview($admin, $id);
        return ApiResponder::ok(['deleted' => true, 'message' => 'دیدگاه حذف شد']);
    }
}
