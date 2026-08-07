import '../listeners';
import { db, nextId } from '../db';
import { apiError, err404, err422 } from '../errors';
import { emit, EVT } from '../events';
import { effectivePriceOf } from '../serializers';
import { toOrderDto, toOrderHistoryDto, toPaymentDto } from '../resources';
import { cartItemsOf, computeCouponDiscount, emptyUserCart, findCartForUser } from './cart.service';
import { randomToken, randomRefNumber } from '../security';
import type * as D from '@/types/domain';

const now = () => new Date().toISOString();

const nextOrderNumber = (): string => {
  const max = db.orders.reduce((m, o) => {
    const n = Number(o.order_number.replace('GNK-', ''));
    return Number.isFinite(n) ? Math.max(m, n) : m;
  }, 100200);
  return `GNK-${max + 1}`;
};

const historyOf = (order: D.Order) =>
  db.order_status_history
    .filter((h) => h.order_id === order.id)
    .sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at))
    .map(toOrderHistoryDto);

const pushHistory = (order: D.Order, oldStatus: D.OrderStatus | null, description: string, changedBy: number | null = null) => {
  db.order_status_history.push({
    id: nextId(db.order_status_history), order_id: order.id,
    old_status: oldStatus, new_status: order.status, description,
    changed_by: changedBy, created_at: now(), updated_at: now(),
  });
};

export function findOrderByKey(key: string): D.Order | undefined {
  const numeric = Number(key);
  return db.orders.find((o) => o.order_number === key || (Number.isFinite(numeric) && o.id === numeric));
}

export const orderDetailDto = (o: D.Order) => ({ ...toOrderDto(o), history: historyOf(o) });

// ─── تسویه حساب ───
export interface CheckoutInput {
  address_id: number;
  payment_method: D.PaymentMethod;
  shipping_method_id?: number;
  notes?: string;
}

export function checkout(user: D.User, input: CheckoutInput) {
  const cart = findCartForUser(user.id);
  const items = cart ? cartItemsOf(cart.id) : [];
  if (!cart || !items.length) throw err422({ cart: ['سبد خرید شما خالی است'] });

  const address = db.addresses.find((a) => a.id === input.address_id && a.user_id === user.id);
  if (!address) throw err422({ address_id: ['آدرس انتخاب شده معتبر نیست'] });

  const method = db.shipping_methods.find(
    (m) => m.id === (input.shipping_method_id ?? Number(db.settings.default_shipping_method_id ?? 1)) && m.is_active,
  );
  if (!method) throw err422({ shipping_method_id: ['روش ارسال معتبر نیست'] });

  // بررسی مجدد موجودی — مثل Transaction لاراول
  type Line = { variant: D.ProductVariant; quantity: number; unitPrice: number };
  const lines: Line[] = [];
  for (const item of items) {
    const variant = db.product_variants.find((v) => v.id === item.product_variant_id && v.is_active);
    if (!variant) throw err422({ cart: ['یکی از اقلام سبد دیگر موجود نیست'] });
    if (variant.stock < item.quantity) {
      throw err422({ cart: [`موجودی «${db.products.find((p) => p.id === variant.product_id)?.title ?? 'کالا'}» کافی نیست`] });
    }
    lines.push({ variant, quantity: item.quantity, unitPrice: effectivePriceOf(variant) });
  }

  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  const threshold = Number(db.settings.free_shipping_threshold ?? 2000000);
  const shippingCost = subtotal >= threshold ? 0 : method.cost;

  const coupon = cart.coupon_id ? db.coupons.find((c) => c.id === cart.coupon_id) : null;
  const couponDiscount = coupon ? computeCouponDiscount(coupon, items) : 0;
  const total = Math.max(0, subtotal + shippingCost - couponDiscount);

  // ایجاد سفارش (معادل OrderObserver + Transaction)
  const order: D.Order = {
    id: nextId(db.orders), user_id: user.id, address_id: address.id,
    order_number: nextOrderNumber(),
    status: 'pending', payment_status: 'pending', payment_method: input.payment_method,
    subtotal, shipping_cost: shippingCost, tax_amount: 0,
    discount_amount: couponDiscount, total_amount: total,
    coupon_id: coupon?.id ?? null, coupon_discount: couponDiscount,
    notes: input.notes ?? null,
    shipped_at: null, delivered_at: null, cancelled_at: null, cancellation_reason: null,
    created_at: now(), updated_at: now(), deleted_at: null,
  };
  db.orders.push(order);

  for (const line of lines) {
    db.order_items.push({
      id: nextId(db.order_items), order_id: order.id, product_variant_id: line.variant.id,
      product_title: db.products.find((p) => p.id === line.variant.product_id)?.title ?? '',
      variant_info: {
        sku: line.variant.sku,
        color: db.colors.find((c) => c.id === line.variant.color_id)?.name,
        size: db.sizes.find((s) => s.id === line.variant.size_id)?.name,
        guarantee: db.guarantees.find((g) => g.id === line.variant.guarantee_id)?.title,
      },
      quantity: line.quantity, unit_price: line.unitPrice,
      total_price: line.unitPrice * line.quantity, created_at: now(), updated_at: now(),
    });
    line.variant.stock = Math.max(0, line.variant.stock - line.quantity);
    if (line.variant.stock === 0) emit(EVT.StockDepleted, { variantId: line.variant.id, productId: line.variant.product_id });
  }
  if (coupon) coupon.used_count += 1;

  pushHistory(order, null, 'سفارش ثبت شد');
  emptyUserCart(cart);
  emit(EVT.OrderPlaced, { orderId: order.id, orderNumber: order.order_number, userId: user.id, amount: order.total_amount });

  // پرداخت کیف‌پول → تسویه آنی
  if (input.payment_method === 'wallet') {
    const wallet = db.wallets.find((w) => w.user_id === user.id);
    if (!wallet || wallet.balance < total) {
      throw apiError(422, 'موجودی کیف پول شما برای تکمیل سفارش کافی نیست');
    }
    wallet.balance -= total;
    db.wallet_transactions.push({
      id: nextId(db.wallet_transactions), wallet_id: wallet.id, type: 'withdraw',
      amount: total, description: `پرداخت سفارش ${order.order_number}`,
      reference_id: order.order_number, created_at: now(), updated_at: now(),
    });
    const payment: D.Payment = {
      id: nextId(db.payments), user_id: user.id, order_id: order.id, amount: total,
      method: 'wallet', status: 'success',
      transaction_id: `W-${order.order_number}-${randomToken().slice(0, 8)}`,
      ref_number: randomRefNumber(), gateway_response: null,
      paid_at: now(), created_at: now(), updated_at: now(),
    };
    db.payments.push(payment);
    markOrderPaid(order);
    emit(EVT.PaymentVerified, { paymentId: payment.id, orderId: order.id, userId: user.id });
    return { order: orderDetailDto(order), payment: toPaymentDto(payment), requiresRedirect: false, payUrl: null };
  }

  return { order: orderDetailDto(order), payment: null, requiresRedirect: true, payUrl: null };
}

/** علامت‌گذاری سفارش پرداخت‌شده — توسط payment.service هم استفاده می‌شود */
export function markOrderPaid(order: D.Order): void {
  order.payment_status = 'paid';
  order.status = 'processing';
  order.updated_at = now();
  pushHistory(order, 'pending', 'پرداخت با موفقیت انجام شد');
  emit(EVT.OrderStatusChanged, {
    orderId: order.id, orderNumber: order.order_number,
    userId: order.user_id, oldStatus: 'pending', newStatus: 'processing',
  });
}

// ─── لیست و جزییات کاربر ───
export function listUserOrders(user: D.User, page: number, perPage: number, status?: D.OrderStatus) {
  let list = db.orders.filter((o) => o.user_id === user.id && !o.deleted_at);
  if (status) list = list.filter((o) => o.status === status);
  list = [...list].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  const total = list.length;
  return { items: list.slice((page - 1) * perPage, page * perPage).map((o) => orderDetailDto(o)), total };
}

export function findUserOrder(user: D.User, key: string): D.Order {
  const order = findOrderByKey(key);
  if (!order || (order.user_id !== user.id && user.role !== 'admin' && user.role !== 'super_admin')) {
    throw err404('سفارش مورد نظر یافت نشد');
  }
  return order;
}

const refundToWallet = (order: D.Order, reasonText: string) => {
  if (order.payment_status !== 'paid') return;
  const wallet = db.wallets.find((w) => w.user_id === order.user_id)
    ?? db.wallets[db.wallets.push({ id: nextId(db.wallets), user_id: order.user_id, balance: 0, created_at: now(), updated_at: now() }) - 1];
  wallet.balance += order.total_amount;
  db.wallet_transactions.push({
    id: nextId(db.wallet_transactions), wallet_id: wallet.id, type: 'deposit',
    amount: order.total_amount, description: reasonText,
    reference_id: order.order_number, created_at: now(), updated_at: now(),
  });
  order.payment_status = 'refunded';
  db.payments.forEach((p) => {
    if (p.order_id === order.id && p.status === 'success') p.status = 'refunded';
  });
};

export function cancelOrder(user: D.User, key: string, reason: string) {
  const order = findUserOrder(user, key);
  if (!['pending', 'processing'].includes(order.status)) {
    throw err422({ order: ['این سفارش دیگر قابل لغو نیست'] });
  }
  const oldStatus = order.status;
  // بازگشت موجودی
  db.order_items.filter((i) => i.order_id === order.id).forEach((i) => {
    const variant = db.product_variants.find((v) => v.id === i.product_variant_id);
    if (variant) variant.stock += i.quantity;
  });
  refundToWallet(order, `بازگشت وجه کنسلی سفارش ${order.order_number}`);
  order.status = 'cancelled';
  order.cancelled_at = now();
  order.cancellation_reason = reason;
  order.updated_at = now();
  pushHistory(order, oldStatus, `لغو سفارش: ${reason}`, user.id);
  emit(EVT.OrderStatusChanged, { orderId: order.id, orderNumber: order.order_number, userId: order.user_id, oldStatus, newStatus: 'cancelled' });
  return orderDetailDto(order);
}

export function returnOrder(user: D.User, key: string, reason: string) {
  const order = findUserOrder(user, key);
  if (order.status !== 'delivered') throw err422({ order: ['فقط سفارش‌های تحویل‌شده قابل مرجوع‌کردن هستند'] });
  const oldStatus = order.status;
  refundToWallet(order, `بازگشت وجه مرجوعی سفارش ${order.order_number}`);
  order.status = 'returned';
  order.updated_at = now();
  pushHistory(order, oldStatus, `درخواست مرجوعی: ${reason}`, user.id);
  emit(EVT.OrderStatusChanged, { orderId: order.id, orderNumber: order.order_number, userId: order.user_id, oldStatus, newStatus: 'returned' });
  return orderDetailDto(order);
}

// ─── ادمین ───
export function adminListOrders(filters: { status?: D.OrderStatus; q?: string; page: number; perPage: number }) {
  let list = db.orders.filter((o) => !o.deleted_at);
  if (filters.status) list = list.filter((o) => o.status === filters.status);
  if (filters.q) {
    const q = filters.q.trim();
    list = list.filter((o) => o.order_number.includes(q));
  }
  list = [...list].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  return { items: list.slice((filters.page - 1) * filters.perPage, filters.page * filters.perPage).map(orderDetailDto), total: list.length };
}

const TRANSITIONS: Record<D.OrderStatus, D.OrderStatus[]> = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: ['returned'],
  cancelled: [],
  returned: [],
};

export function adminUpdateOrderStatus(admin: D.User, orderId: number, newStatus: D.OrderStatus, description?: string) {
  const order = db.orders.find((o) => o.id === orderId);
  if (!order) throw err404('سفارش یافت نشد');
  if (!TRANSITIONS[order.status].includes(newStatus)) {
    throw err422({ status: [`تغییر وضعیت از «${order.status}» به «${newStatus}» مجاز نیست`] });
  }
  const oldStatus = order.status;
  order.status = newStatus;
  order.updated_at = now();
  if (newStatus === 'shipped') order.shipped_at = now();
  if (newStatus === 'delivered') order.delivered_at = now();
  if (newStatus === 'cancelled') {
    order.cancelled_at = now();
    order.cancellation_reason = description ?? 'لغو توسط مدیر';
    refundToWallet(order, `بازگشت وجه کنسلی سفارش ${order.order_number}`);
  }
  if (newStatus === 'returned') refundToWallet(order, `بازگشت وجه مرجوعی سفارش ${order.order_number}`);
  pushHistory(order, oldStatus, description ?? '', admin.id);
  emit(EVT.OrderStatusChanged, { orderId: order.id, orderNumber: order.order_number, userId: order.user_id, oldStatus, newStatus });
  return orderDetailDto(order);
}
