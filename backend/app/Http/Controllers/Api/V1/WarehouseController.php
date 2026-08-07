<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\WarehouseStockAdjustRequest;
use App\Services\WarehouseService;
use App\Support\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** پنل انبار — نقش‌های warehouse + admin + super_admin (middleware role) */
class WarehouseController
{
    public function dashboard(): JsonResponse
    {
        return ApiResponder::ok(WarehouseService::warehouseDashboard());
    }

    public function inventory(Request $request): JsonResponse
    {
        $page = max(1, ApiResponder::intParam($request->query('page'), 1));
        $perPage = min(50, max(1, ApiResponder::intParam($request->query('per_page'), 15)));
        $result = WarehouseService::inventoryList([
            'q' => $request->query('q'),
            'state' => $request->query('state'),
            'page' => $page,
            'perPage' => $perPage,
        ]);
        return ApiResponder::page($result['items'], $result['total'], $page, $perPage);
    }

    public function adjustStock(WarehouseStockAdjustRequest $request, int $id): JsonResponse
    {
        $user = $request->attributes->get('gnk_user');
        $data = $request->validated();
        return ApiResponder::ok(WarehouseService::adjustStock($user, $id, (int) round((float) $data['stock']), $data['reason'] ?? null));
    }

    public function shipments(Request $request): JsonResponse
    {
        $state = $request->query('state') === 'shipped' ? 'shipped' : 'ready';
        $page = max(1, ApiResponder::intParam($request->query('page'), 1));
        $result = WarehouseService::shipmentsList($state, $page, 10);
        return ApiResponder::page($result['items'], $result['total'], $page, 10);
    }

    public function ship(Request $request, int $id): JsonResponse
    {
        $user = $request->attributes->get('gnk_user');
        return ApiResponder::ok(WarehouseService::shipOrder($user, $id));
    }

    public function movements(Request $request): JsonResponse
    {
        $page = max(1, ApiResponder::intParam($request->query('page'), 1));
        $result = WarehouseService::movementLog($page, 20);
        return ApiResponder::page($result['items'], $result['total'], $page, 20);
    }
}
