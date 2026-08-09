<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Requests\AdminBrandCreateRequest;
use App\Http\Requests\AdminCategoryCreateRequest;
use App\Services\AdminCatalogService;
use App\Support\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** دسته‌بندی‌ها و برندها */
class AdminCatalogController
{
    // ─── دسته‌بندی‌ها ───
    public function categories(): JsonResponse
    {
        return ApiResponder::ok(AdminCatalogService::adminListCategories());
    }

    public function storeCategory(AdminCategoryCreateRequest $request): JsonResponse
    {
        $admin = $request->attributes->get('gnk_user');
        return ApiResponder::ok(AdminCatalogService::adminCreateCategory($admin, $request->validated()), 201);
    }

    public function updateCategory(Request $request, int $id): JsonResponse
    {
        $admin = $request->attributes->get('gnk_user');
        return ApiResponder::ok(AdminCatalogService::adminUpdateCategory($admin, $id, $request->all()));
    }

    public function destroyCategory(Request $request, int $id): JsonResponse
    {
        $admin = $request->attributes->get('gnk_user');
        AdminCatalogService::adminDeleteCategory($admin, $id);
        return ApiResponder::ok(['deleted' => true, 'message' => 'دسته‌بندی حذف شد']);
    }

    // ─── برندها ───
    public function brands(): JsonResponse
    {
        return ApiResponder::ok(AdminCatalogService::adminListBrands());
    }

    public function storeBrand(AdminBrandCreateRequest $request): JsonResponse
    {
        $admin = $request->attributes->get('gnk_user');
        return ApiResponder::ok(AdminCatalogService::adminCreateBrand($admin, $request->validated()), 201);
    }

    public function updateBrand(Request $request, int $id): JsonResponse
    {
        $admin = $request->attributes->get('gnk_user');
        return ApiResponder::ok(AdminCatalogService::adminUpdateBrand($admin, $id, $request->all()));
    }

    public function destroyBrand(Request $request, int $id): JsonResponse
    {
        $admin = $request->attributes->get('gnk_user');
        AdminCatalogService::adminDeleteBrand($admin, $id);
        return ApiResponder::ok(['deleted' => true, 'message' => 'برند حذف شد']);
    }
}
