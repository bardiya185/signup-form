<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Services\PaymentService;
use App\Support\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminPaymentController
{
    public function index(Request $request): JsonResponse
    {
        $page = max(1, ApiResponder::intParam($request->query('page'), 1));
        $perPage = min(50, max(1, ApiResponder::intParam($request->query('per_page'), 15)));
        $result = PaymentService::adminListPayments(
            $request->query('status'),
            $request->query('method'),
            $page,
            $perPage
        );
        return ApiResponder::page($result['items'], $result['total'], $page, $perPage);
    }
}
