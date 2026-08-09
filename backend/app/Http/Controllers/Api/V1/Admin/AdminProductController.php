<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Requests\AdminProductCreateRequest;
use App\Services\AdminCatalogService;
use App\Support\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminProductController
{
    public function index(Request $request): JsonResponse
    {
        $page = max(1, ApiResponder::intParam($request->query('page'), 1));
        $perPage = min(50, max(1, ApiResponder::intParam($request->query('per_page'), 15)));
        $result = AdminCatalogService::adminListProducts([
            'q' => $request->query('q'),
            'status' => $request->query('status'),
            'category' => $request->query('category'),
            'page' => $page,
            'perPage' => $perPage,
        ]);
        return ApiResponder::page($result['items'], $result['total'], $page, $perPage);
    }

    public function store(AdminProductCreateRequest $request): JsonResponse
    {
        $admin = $request->attributes->get('gnk_user');
        return ApiResponder::ok(AdminCatalogService::adminCreateProduct($admin, $request->validated()), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $admin = $request->attributes->get('gnk_user');
        return ApiResponder::ok(AdminCatalogService::adminUpdateProduct($admin, $id, $request->all()));
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $admin = $request->attributes->get('gnk_user');
        AdminCatalogService::adminDeleteProduct($admin, $id);
        return ApiResponder::ok(['deleted' => true, 'message' => 'محصول حذف شد']);
    }
}
