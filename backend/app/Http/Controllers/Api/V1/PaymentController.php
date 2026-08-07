<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\PaymentCreateRequest;
use App\Services\PaymentService;
use App\Support\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController
{
    public function index(Request $request): JsonResponse
    {
        $page = max(1, ApiResponder::intParam($request->query('page'), 1));
        $perPage = min(30, max(1, ApiResponder::intParam($request->query('per_page'), 15)));
        $result = PaymentService::listUserPayments($request->attributes->get('gnk_user'), $page, $perPage);
        return ApiResponder::page($result['items'], $result['total'], $page, $perPage);
    }

    public function create(PaymentCreateRequest $request): JsonResponse
    {
        $input = $request->validated();
        $origin = $request->getSchemeAndHttpHost();
        $result = PaymentService::createOrderPayment($request->attributes->get('gnk_user'), $input['order_number'], $input['gateway'], $origin);
        return ApiResponder::ok($result, 201);
    }

    /** تایید تراکنش — معادل PaymentController@verify (کالبک درگاه سندباکس) */
    public function verify(Request $request): JsonResponse
    {
        $authority = (string) $request->query('Authority', '');
        $status = (string) $request->query('Status', 'OK');
        return ApiResponder::ok(PaymentService::verifyPayment($authority, $status));
    }

    public function callback(Request $request, string $gateway): JsonResponse
    {
        return $this->verify($request);
    }
}
