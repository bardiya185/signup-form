import '../listeners';
import { db, nextId } from '../db';
import { err404, err422 } from '../errors';
import { emit, EVT } from '../events';
import { randomRefNumber, randomToken } from '../security';
import { toPaymentDto } from '../resources';
import { markOrderPaid } from './order.service';
import type * as D from '@/types/domain';

const now = () => new Date().toISOString();
const GATEWAYS = ['zarinpal', 'mellat', 'saman'] as const;
type Gateway = (typeof GATEWAYS)[number];

/**
 * ساخت تراکنش برای سفارش — درگاه‌ها در حالت Sandbox:
 * به‌جای ریدایرکت واقعی، payUrl به صفحه callback داخلی برمی‌گردد.
 */
export function createOrderPayment(user: D.User, orderNumber: string, gateway: Gateway, origin: string) {
  const order = db.orders.find((o) => o.order_number === orderNumber && o.user_id === user.id);
  if (!order) throw err404('سفارش یافت نشد');
  if (order.payment_status !== 'pending') throw err422({ order: ['این سفارش قبلاً پرداخت شده است'] });
  if (order.status === 'cancelled') throw err422({ order: ['این سفارش لغو شده است'] });

  const existing = db.payments.find((p) => p.order_id === order.id && p.status === 'pending');
  const transactionId = existing?.transaction_id ?? `A${order.order_number.replace(/\D/g, '')}${gateway.slice(0, 2).toUpperCase()}${randomToken().slice(0, 6)}`;
  const payment: D.Payment = existing ?? {
    id: nextId(db.payments), user_id: user.id, order_id: order.id,
    amount: order.total_amount, method: gateway, status: 'pending',
    transaction_id: transactionId, ref_number: null, gateway_response: null,
    paid_at: null, created_at: now(), updated_at: now(),
  };
  if (!existing) db.payments.push(payment);

  const payUrl = `${origin}/checkout/payment/callback?gateway=${gateway}&Authority=${transactionId}&Status=OK&order=${order.order_number}`;
  return { payment: toPaymentDto(payment), payUrl, expiresIn: 900 };
}

/** شارژ کیف پول از طریق درگاه */
export function createWalletDeposit(user: D.User, amount: number, gateway: Gateway, origin: string) {
  if (amount < 10000) throw err422({ amount: ['حداقل مبلغ شارژ کیف پول ۱۰ هزار تومان است'] });
  if (amount > 50_000_000) throw err422({ amount: ['حداکثر مبلغ شارژ کیف پول ۵۰ میلیون تومان است'] });
  const transactionId = `W${randomToken().slice(0, 10)}`;
  const payment: D.Payment = {
    id: nextId(db.payments), user_id: user.id, order_id: null,
    amount, method: gateway, status: 'pending',
    transaction_id: transactionId, ref_number: null,
    gateway_response: { purpose: 'wallet_charge' },
    paid_at: null, created_at: now(), updated_at: now(),
  };
  db.payments.push(payment);
  const payUrl = `${origin}/checkout/payment/callback?gateway=${gateway}&Authority=${transactionId}&Status=OK`;
  return { payment: toPaymentDto(payment), payUrl };
}

/**
 * تایید تراکنش — معادل PaymentController@verify لاراول.
 * درگاه واقعی در پروداکشن جای گزینی می‌شود؛ رابط ورودی/خروجی یکسان است.
 */
export function verifyPayment(authority: string, status: string) {
  const payment = db.payments.find((p) => p.transaction_id === authority);
  if (!payment) throw err404('تراکنش مورد نظر یافت نشد');
  const order = payment.order_id ? db.orders.find((o) => o.id === payment.order_id) : null;

  if (payment.status === 'success') {
    return { status: 'success' as const, refNumber: payment.ref_number, orderNumber: order?.order_number ?? null, amount: payment.amount, alreadyVerified: true };
  }
  if (status !== 'OK') {
    payment.status = 'failed';
    payment.gateway_response = { ...(payment.gateway_response ?? {}), cancel: true };
    emit(EVT.PaymentFailed, { paymentId: payment.id, orderId: payment.order_id, userId: payment.user_id });
    return { status: 'failed' as const, refNumber: null, orderNumber: order?.order_number ?? null, amount: payment.amount, alreadyVerified: false };
  }

  payment.status = 'success';
  payment.ref_number = randomRefNumber();
  payment.paid_at = now();

  if (order) {
    markOrderPaid(order);
  } else {
    // شارژ کیف پول
    const wallet = db.wallets.find((w) => w.user_id === payment.user_id)
      ?? db.wallets[db.wallets.push({ id: nextId(db.wallets), user_id: payment.user_id, balance: 0, created_at: now(), updated_at: now() }) - 1];
    wallet.balance += payment.amount;
    db.wallet_transactions.push({
      id: nextId(db.wallet_transactions), wallet_id: wallet.id, type: 'deposit',
      amount: payment.amount, description: 'شارژ کیف پول از درگاه',
      reference_id: payment.ref_number, created_at: now(), updated_at: now(),
    });
  }
  emit(EVT.PaymentVerified, { paymentId: payment.id, orderId: payment.order_id, userId: payment.user_id });
  return { status: 'success' as const, refNumber: payment.ref_number, orderNumber: order?.order_number ?? null, amount: payment.amount, alreadyVerified: false };
}

export function listUserPayments(user: D.User, page: number, perPage: number) {
  const list = db.payments
    .filter((p) => p.user_id === user.id)
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  return { items: list.slice((page - 1) * perPage, page * perPage).map(toPaymentDto), total: list.length };
}

export function adminListPayments(filters: { status?: string; method?: string; page: number; perPage: number }) {
  let list = [...db.payments];
  if (filters.status) list = list.filter((p) => p.status === filters.status);
  if (filters.method) list = list.filter((p) => p.method === filters.method);
  list = list.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  return { items: list.slice((filters.page - 1) * filters.perPage, filters.page * filters.perPage).map(toPaymentDto), total: list.length };
}
