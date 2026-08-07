<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Services\AdminService;
use App\Support\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminDashboardController
{
    public function dashboard(): JsonResponse
    {
        return ApiResponder::ok(AdminService::dashboard());
    }

    public function salesReport(Request $request): JsonResponse
    {
        $days = min(60, max(7, ApiResponder::intParam($request->query('days'), 14)));
        return ApiResponder::ok(AdminService::salesReport($days));
    }

    public function productsReport(): JsonResponse
    {
        return ApiResponder::ok(AdminService::productsReport());
    }

    public function usersReport(): JsonResponse
    {
        return ApiResponder::ok(AdminService::usersReport());
    }

    public function revenueReport(): JsonResponse
    {
        return ApiResponder::ok(AdminService::revenueReport());
    }
}
