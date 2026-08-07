<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\WalletDepositRequest;
use App\Services\PaymentService;
use App\Support\ApiResponder;
use App\Support\Dto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WalletController
{
    private function walletOf(object $user): object
    {
        $wallet = Dto::rows('wallets')->firstWhere('user_id', $user->id);
        if (!$wallet) {
            $id = DB::table('wallets')->insertGetId([
                'user_id' => $user->id, 'balance' => 0, 'created_at' => Dto::now(), 'updated_at' => Dto::now(),
            ]);
            Dto::flush();
            $wallet = Dto::find('wallets', $id);
        }
        return $wallet;
    }

    public function show(Request $request): JsonResponse
    {
        $wallet = $this->walletOf($request->attributes->get('gnk_user'));
        $txs = Dto::rows('wallet_transactions')->where('wallet_id', $wallet->id);
        return ApiResponder::ok([
            'balance' => (int) $wallet->balance,
            'totalDeposits' => (int) $txs->where('type', 'deposit')->sum('amount'),
            'totalWithdraws' => (int) $txs->where('type', 'withdraw')->sum('amount'),
            'transactionsCount' => $txs->count(),
        ]);
    }

    public function transactions(Request $request): JsonResponse
    {
        $wallet = $this->walletOf($request->attributes->get('gnk_user'));
        $page = max(1, ApiResponder::intParam($request->query('page'), 1));
        $perPage = min(30, max(1, ApiResponder::intParam($request->query('per_page'), 15)));
        $list = Dto::rows('wallet_transactions')->where('wallet_id', $wallet->id)->sortByDesc('created_at')->values();
        $items = $list->slice(($page - 1) * $perPage, $perPage)->map(fn (object $t) => Dto::walletTxDto($t))->values()->all();
        return ApiResponder::page($items, $list->count(), $page, $perPage);
    }

    public function deposit(WalletDepositRequest $request): JsonResponse
    {
        $input = $request->validated();
        $origin = $request->getSchemeAndHttpHost();
        $result = PaymentService::createWalletDeposit($request->attributes->get('gnk_user'), (int) $input['amount'], $input['gateway'], $origin);
        return ApiResponder::ok($result, 201);
    }
}
