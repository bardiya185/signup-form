<?php

namespace App\Services;

use App\Support\ApiException;
use App\Support\DemoHash;
use App\Support\Dto;
use Illuminate\Support\Facades\DB;

/**
 * پورت کامل payment.service.ts — درگاه‌های Sandbox:
 * به‌جای ریدایرکت واقعی، payUrl به صفحه callback داخلی برمی‌گردد.
 */
final class PaymentService
{
    public const GATEWAYS = ['zarinpal', 'mellat', 'saman'];

    public static function createOrderPayment(object $user, string $orderNumber, string $gateway, string $origin): array
    {
        $order = Dto::rows('orders')->first(fn (object $o) => $o->order_number === $orderNumber && (int) $o->user_id === (int) $user->id);
        if (!$order) {
            throw ApiException::notFound('سفارش یافت نشد');
        }
        if ($order->payment_status !== 'pending') {
            throw ApiException::unprocessable(['order' => ['این سفارش قبلاً پرداخت شده است']]);
        }
        if ($order->status === 'cancelled') {
            throw ApiException::unprocessable(['order' => ['این سفارش لغو شده است']]);
        }

        $existing = Dto::rows('payments')->first(fn (object $p) => (int) $p->order_id === (int) $order->id && $p->status === 'pending');
        if ($existing) {
            $payment = $existing;
        } else {
            $digits = preg_replace('/\D/', '', (string) $order->order_number);
            $transactionId = 'A' . $digits . strtoupper(substr($gateway, 0, 2)) . substr(DemoHash::token(), 0, 6);
            $id = DB::table('payments')->insertGetId([
                'user_id' => $user->id, 'order_id' => $order->id,
                'amount' => $order->total_amount, 'method' => $gateway, 'status' => 'pending',
                'transaction_id' => $transactionId, 'ref_number' => null, 'gateway_response' => null,
                'paid_at' => null, 'created_at' => Dto::now(), 'updated_at' => Dto::now(),
            ]);
            Dto::flush();
            $payment = Dto::find('payments', $id);
        }

        $payUrl = "{$origin}/checkout/payment/callback?gateway={$gateway}&Authority={$payment->transaction_id}&Status=OK&order={$order->order_number}";
        return ['payment' => Dto::paymentDto($payment), 'payUrl' => $payUrl, 'expiresIn' => 900];
    }

    public static function createWalletDeposit(object $user, int $amount, string $gateway, string $origin): array
    {
        if ($amount < 10000) {
            throw ApiException::unprocessable(['amount' => ['حداقل مبلغ شارژ کیف پول ۱۰ هزار تومان است']]);
        }
        if ($amount > 50_000_000) {
            throw ApiException::unprocessable(['amount' => ['حداکثر مبلغ شارژ کیف پول ۵۰ میلیون تومان است']]);
        }
        $transactionId = 'W' . substr(DemoHash::token(), 0, 10);
        $id = DB::table('payments')->insertGetId([
            'user_id' => $user->id, 'order_id' => null, 'amount' => $amount,
            'method' => $gateway, 'status' => 'pending', 'transaction_id' => $transactionId,
            'ref_number' => null, 'gateway_response' => json_encode(['purpose' => 'wallet_charge']),
            'paid_at' => null, 'created_at' => Dto::now(), 'updated_at' => Dto::now(),
        ]);
        Dto::flush();
        $payUrl = "{$origin}/checkout/payment/callback?gateway={$gateway}&Authority={$transactionId}&Status=OK";
        return ['payment' => Dto::paymentDto(Dto::find('payments', $id)), 'payUrl' => $payUrl];
    }

    /** تایید تراکنش — معادل PaymentController@verify */
    public static function verifyPayment(string $authority, string $status): array
    {
        $payment = Dto::rows('payments')->firstWhere('transaction_id', $authority);
        if (!$payment) {
            throw ApiException::notFound('تراکنش مورد نظر یافت نشد');
        }
        $order = $payment->order_id !== null ? Dto::find('orders', (int) $payment->order_id) : null;

        if ($payment->status === 'success') {
            return [
                'status' => 'success', 'refNumber' => $payment->ref_number,
                'orderNumber' => $order?->order_number, 'amount' => (int) $payment->amount, 'alreadyVerified' => true,
            ];
        }
        if ($status !== 'OK') {
            DB::table('payments')->where('id', $payment->id)->update([
                'status' => 'failed',
                'gateway_response' => json_encode(array_merge(Dto::js($payment->gateway_response), ['cancel' => true]), JSON_UNESCAPED_UNICODE),
            ]);
            // رویداد PaymentFailed
            if ($order) {
                Dto::notify((int) $payment->user_id, 'order_status', 'پرداخت ناموفق',
                    "پرداخت سفارش {$order->order_number} انجام نشد؛ می‌توانید دوباره تلاش کنید.",
                    ['orderNumber' => $order->order_number]);
            }
            return [
                'status' => 'failed', 'refNumber' => null,
                'orderNumber' => $order?->order_number, 'amount' => (int) $payment->amount, 'alreadyVerified' => false,
            ];
        }

        DB::table('payments')->where('id', $payment->id)->update([
            'status' => 'success', 'ref_number' => DemoHash::refNumber(), 'paid_at' => Dto::now(),
        ]);
        Dto::flush();
        $payment = Dto::find('payments', (int) $payment->id);

        if ($order) {
            OrderService::markOrderPaid($order);
            // رویداد PaymentVerified برای سفارش
            Dto::notify((int) $payment->user_id, 'order_status', 'پرداخت موفق',
                "پرداخت سفارش {$order->order_number} با موفقیت انجام شد. کد رهگیری: {$payment->ref_number}",
                ['orderNumber' => $order->order_number]);
        } else {
            // شارژ کیف پول
            $wallet = Dto::rows('wallets')->firstWhere('user_id', $payment->user_id);
            if (!$wallet) {
                $walletId = DB::table('wallets')->insertGetId([
                    'user_id' => $payment->user_id, 'balance' => 0, 'created_at' => Dto::now(), 'updated_at' => Dto::now(),
                ]);
                $wallet = (object) ['id' => $walletId, 'balance' => 0];
            }
            DB::table('wallets')->where('id', $wallet->id)->update([
                'balance' => (int) $wallet->balance + (int) $payment->amount, 'updated_at' => Dto::now(),
            ]);
            DB::table('wallet_transactions')->insert([
                'wallet_id' => $wallet->id, 'type' => 'deposit', 'amount' => $payment->amount,
                'description' => 'شارژ کیف پول از درگاه', 'reference_id' => $payment->ref_number,
                'created_at' => Dto::now(), 'updated_at' => Dto::now(),
            ]);
            Dto::notify((int) $payment->user_id, 'system', 'شارژ کیف پول',
                'کیف پول شما ' . Dto::faNum((int) $payment->amount) . ' تومان شارژ شد.');
        }
        Dto::flush();
        return [
            'status' => 'success', 'refNumber' => $payment->ref_number,
            'orderNumber' => $order?->order_number, 'amount' => (int) $payment->amount, 'alreadyVerified' => false,
        ];
    }

    public static function listUserPayments(object $user, int $page, int $perPage): array
    {
        $list = Dto::rows('payments')->where('user_id', $user->id)->sortByDesc('created_at')->values();
        return [
            'items' => $list->slice(($page - 1) * $perPage, $perPage)->map(fn (object $p) => Dto::paymentDto($p))->values()->all(),
            'total' => $list->count(),
        ];
    }
}
