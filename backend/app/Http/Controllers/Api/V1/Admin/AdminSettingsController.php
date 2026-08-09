<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Services\AdminService;
use App\Support\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminSettingsController
{
    public function show(): JsonResponse
    {
        return ApiResponder::ok(AdminService::getSettings());
    }

    public function update(Request $request): JsonResponse
    {
        $admin = $request->attributes->get('gnk_user');
        $patch = $request->all();
        return ApiResponder::ok(AdminService::updateSettings($admin, is_array($patch) ? $patch : []));
    }
}
