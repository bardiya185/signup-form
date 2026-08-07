<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Requests\AdminOrderStatusRequest;
use App\Services\OrderService;
use App\Support\ApiException;
use App\Support\ApiResponder;
use App\Support\Dto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminOrderController
{
    private const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];

    public function index(Request $request): JsonResponse
    {
        $page = max(1, ApiResponder::intParam($request->query('page'), 1));
        $perPage = min(50, max(1, ApiResponder::intParam($request->query('per_page'), 15)));
        $status = $request->query('status');
        $status = in_array($status, self::STATUSES, true) ? $status : null;
        $result = OrderService::adminListOrders($status, $request->query('q'), $page, $perPage);
        return ApiResponder::page($result['items'], $result['total'], $page, $perPage);
    }

    public function show(int $id): JsonResponse
    {
        $order = Dto::find('orders', $id);
        if (!$order) {
            throw ApiException::notFound('سفارش یافت نشد');
        }
        $payments = Dto::rows('payments')->where('order_id', $order->id)
            ->map(fn (object $p) => Dto::paymentDto($p))->values()->all();
        return ApiResponder::ok(array_merge(Dto::orderDetailDto($order), ['payments' => $payments]));
    }

    public function update(AdminOrderStatusRequest $request, int $id): JsonResponse
    {
        $admin = $request->attributes->get('gnk_user');
        $data = $request->validated();
        return ApiResponder::ok(OrderService::adminUpdateOrderStatus($admin, $id, $data['status'], $data['description'] ?? null));
    }
}
