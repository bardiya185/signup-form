<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Requests\AdminSellerStatusRequest;
use App\Http\Requests\AdminUserStatusRequest;
use App\Services\AdminCatalogService;
use App\Services\AdminService;
use App\Support\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** کاربران و فروشندگان */
class AdminUserController
{
    public function users(Request $request): JsonResponse
    {
        $page = max(1, ApiResponder::intParam($request->query('page'), 1));
        $perPage = min(50, max(1, ApiResponder::intParam($request->query('per_page'), 15)));
        $result = AdminService::listUsers([
            'q' => $request->query('q'),
            'role' => $request->query('role'),
            'status' => $request->query('status'),
            'page' => $page,
            'perPage' => $perPage,
        ]);
        return ApiResponder::page($result['items'], $result['total'], $page, $perPage);
    }

    public function updateUser(AdminUserStatusRequest $request, int $id): JsonResponse
    {
        $admin = $request->attributes->get('gnk_user');
        return ApiResponder::ok(AdminService::updateUserStatus($admin, $id, $request->validated()['status']));
    }

    public function sellers(): JsonResponse
    {
        return ApiResponder::ok(AdminCatalogService::adminListSellers());
    }

    public function updateSeller(AdminSellerStatusRequest $request, int $id): JsonResponse
    {
        $admin = $request->attributes->get('gnk_user');
        $data = $request->validated();
        return ApiResponder::ok(AdminCatalogService::adminSetSellerStatus($admin, $id, $data['status'], $data['reason'] ?? null));
    }
}
