<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Requests\AdminCouponCreateRequest;
use App\Http\Requests\AdminOfferCreateRequest;
use App\Services\AdminCatalogService;
use App\Support\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** کوپن‌های تخفیف و پیشنهادهای ویژه */
class AdminPromotionController
{
    // ─── کوپن‌ها ───
    public function coupons(): JsonResponse
    {
        return ApiResponder::ok(AdminCatalogService::adminListCoupons());
    }

    public function storeCoupon(AdminCouponCreateRequest $request): JsonResponse
    {
        $admin = $request->attributes->get('gnk_user');
        return ApiResponder::ok(AdminCatalogService::adminCreateCoupon($admin, $request->validated()), 201);
    }

    public function updateCoupon(Request $request, int $id): JsonResponse
    {
        $admin = $request->attributes->get('gnk_user');
        return ApiResponder::ok(AdminCatalogService::adminUpdateCoupon($admin, $id, $request->all()));
    }

    public function destroyCoupon(Request $request, int $id): JsonResponse
    {
        $admin = $request->attributes->get('gnk_user');
        AdminCatalogService::adminDeleteCoupon($admin, $id);
        return ApiResponder::ok(['deleted' => true, 'message' => 'کوپن حذف شد']);
    }

    // ─── پیشنهادهای ویژه ───
    public function offers(): JsonResponse
    {
        return ApiResponder::ok(AdminCatalogService::adminListOffers());
    }

    public function storeOffer(AdminOfferCreateRequest $request): JsonResponse
    {
        $admin = $request->attributes->get('gnk_user');
        return ApiResponder::ok(AdminCatalogService::adminCreateOffer($admin, $request->validated()), 201);
    }

    public function updateOffer(Request $request, int $id): JsonResponse
    {
        $admin = $request->attributes->get('gnk_user');
        return ApiResponder::ok(AdminCatalogService::adminUpdateOffer($admin, $id, $request->all()));
    }

    public function destroyOffer(Request $request, int $id): JsonResponse
    {
        $admin = $request->attributes->get('gnk_user');
        AdminCatalogService::adminDeleteOffer($admin, $id);
        return ApiResponder::ok(['deleted' => true, 'message' => 'پیشنهاد حذف شد']);
    }
}
