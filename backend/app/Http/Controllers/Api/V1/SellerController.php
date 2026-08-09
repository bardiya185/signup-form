<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\SellerProductCreateRequest;
use App\Http\Requests\SellerProductUpdateRequest;
use App\Http\Requests\SellerRegisterRequest;
use App\Services\SellerService;
use App\Support\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * پنل فروشنده — دسترسی با requireUser (auth.token)؛
 * نبودِ فروشگاه با ۴۰۴ راهنما جواب داده می‌شود (mySeller).
 */
class SellerController
{
    public function register(SellerRegisterRequest $request): JsonResponse
    {
        $user = $request->attributes->get('gnk_user');
        return ApiResponder::ok(SellerService::registerSeller($user, $request->validated()), 201);
    }

    public function dashboard(Request $request): JsonResponse
    {
        $user = $request->attributes->get('gnk_user');
        return ApiResponder::ok(SellerService::sellerDashboard($user));
    }

    public function products(Request $request): JsonResponse
    {
        $user = $request->attributes->get('gnk_user');
        $page = max(1, ApiResponder::intParam($request->query('page'), 1));
        $result = SellerService::sellerProducts($user, $page, 10);
        return ApiResponder::page($result['items'], $result['total'], $page, 10);
    }

    public function storeProduct(SellerProductCreateRequest $request): JsonResponse
    {
        $user = $request->attributes->get('gnk_user');
        return ApiResponder::ok(SellerService::sellerCreateProduct($user, $request->validated()), 201);
    }

    public function updateProduct(SellerProductUpdateRequest $request, int $id): JsonResponse
    {
        $user = $request->attributes->get('gnk_user');
        return ApiResponder::ok(SellerService::sellerUpdateProduct($user, $id, $request->validated()));
    }

    public function orders(Request $request): JsonResponse
    {
        $user = $request->attributes->get('gnk_user');
        return ApiResponder::ok(SellerService::sellerOrders($user));
    }

    public function settlements(Request $request): JsonResponse
    {
        $user = $request->attributes->get('gnk_user');
        return ApiResponder::ok(SellerService::sellerSettlements($user));
    }

    public function analytics(Request $request): JsonResponse
    {
        $user = $request->attributes->get('gnk_user');
        return ApiResponder::ok(SellerService::sellerAnalytics($user));
    }
}
