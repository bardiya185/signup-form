<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\CancelOrderRequest;
use App\Http\Requests\CheckoutRequest;
use App\Services\OrderService;
use App\Support\ApiResponder;
use App\Support\Dto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController
{
    public function index(Request $request): JsonResponse
    {
        $page = max(1, ApiResponder::intParam($request->query('page'), 1));
        $perPage = min(20, max(1, ApiResponder::intParam($request->query('per_page'), 10)));
        $status = $request->query('status');
        $result = OrderService::listUserOrders($request->attributes->get('gnk_user'), $page, $perPage, $status ?: null);
        return ApiResponder::page($result['items'], $result['total'], $page, $perPage);
    }

    public function checkout(CheckoutRequest $request): JsonResponse
    {
        $input = $request->validated();
        $input['shipping_method_id'] = $input['shipping_method_id'] ?? null;
        return ApiResponder::ok(OrderService::checkout($request->attributes->get('gnk_user'), $input), 201);
    }

    public function show(Request $request, string $orderNumber): JsonResponse
    {
        $order = OrderService::findUserOrder($request->attributes->get('gnk_user'), $orderNumber);
        return ApiResponder::ok(Dto::orderDetailDto($order));
    }

    public function cancel(CancelOrderRequest $request, string $orderNumber): JsonResponse
    {
        return ApiResponder::ok(OrderService::cancelOrder($request->attributes->get('gnk_user'), $orderNumber, $request->validated()['reason']));
    }

    public function returnOrder(CancelOrderRequest $request, string $orderNumber): JsonResponse
    {
        return ApiResponder::ok(OrderService::returnOrder($request->attributes->get('gnk_user'), $orderNumber, $request->validated()['reason']));
    }
}
