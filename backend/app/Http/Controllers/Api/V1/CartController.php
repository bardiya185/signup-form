<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\CartItemRequest;
use App\Http\Requests\CouponRequest;
use App\Http\Requests\UpdateCartItemRequest;
use App\Services\CartService;
use App\Support\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController
{
    public function show(Request $request): JsonResponse
    {
        return ApiResponder::ok(CartService::getCart($request));
    }

    public function store(CartItemRequest $request): JsonResponse
    {
        $input = $request->validated();
        return ApiResponder::ok(CartService::addItem($request, (int) $input['product_variant_id'], (int) $input['quantity']));
    }

    public function update(UpdateCartItemRequest $request, int $itemId): JsonResponse
    {
        return ApiResponder::ok(CartService::updateItem($request, $itemId, (int) $request->validated()['quantity']));
    }

    public function destroy(Request $request, int $itemId): JsonResponse
    {
        return ApiResponder::ok(CartService::removeItem($request, $itemId));
    }

    public function clear(Request $request): JsonResponse
    {
        return ApiResponder::ok(CartService::clearCart($request));
    }

    public function applyCoupon(CouponRequest $request): JsonResponse
    {
        return ApiResponder::ok(CartService::applyCoupon($request, $request->validated()['code']));
    }

    public function removeCoupon(Request $request): JsonResponse
    {
        return ApiResponder::ok(CartService::removeCoupon($request));
    }
}
