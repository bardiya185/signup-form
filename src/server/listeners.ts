/**
 * ─── ثبت Listener های رویداد (معادل EventServiceProvider لاراول) ───
 * این ماژول را سرویس‌های emit کننده import می‌کنند تا listenerها فعال شوند.
 */
import { listen, EVT } from './events';
import { db } from './db';
import { logActivity, notify } from './resources';
import { ORDER_STATUS_FA } from './resources';
import type * as D from '@/types/domain';

listen(EVT.UserRegistered, ({ userId, name }) => {
  notify(userId as number, 'system', 'به گینان‌کالا خوش آمدید', `${name ?? 'کاربر'} عزیز، حساب کاربری شما با موفقیت ایجاد شد.`);
  logActivity(userId as number, 'user.register', 'user', userId as number, 'ثبت‌نام کاربر جدید');
});

listen(EVT.OrderPlaced, ({ userId, orderNumber, amount }) => {
  notify(
    userId as number, 'order_status', 'سفارش شما ثبت شد',
    `سفارش ${orderNumber} با مبلغ ${(amount as number).toLocaleString('fa-IR')} تومان ثبت شد و در انتظار پرداخت است.`,
    { orderNumber },
  );
  logActivity(userId as number, 'order.placed', 'order', null, `ثبت سفارش ${orderNumber}`);
});

listen(EVT.OrderStatusChanged, ({ userId, orderNumber, newStatus }) => {
  const status = newStatus as D.OrderStatus;
  notify(
    userId as number, 'order_status', 'به‌روزرسانی سفارش',
    `وضعیت سفارش ${orderNumber} به «${ORDER_STATUS_FA[status] ?? status}» تغییر یافت.`,
    { orderNumber, status },
  );
});

listen(EVT.PaymentVerified, ({ userId, orderId, paymentId }) => {
  const payment = db.payments.find((p) => p.id === paymentId);
  if (!payment) return;
  if (orderId) {
    const order = db.orders.find((o) => o.id === orderId);
    notify(
      userId as number, 'order_status', 'پرداخت موفق',
      `پرداخت سفارش ${order?.order_number ?? ''} با موفقیت انجام شد. کد رهگیری: ${payment.ref_number}`,
      { orderNumber: order?.order_number },
    );
  } else {
    notify(userId as number, 'system', 'شارژ کیف پول', `کیف پول شما ${payment.amount.toLocaleString('fa-IR')} تومان شارژ شد.`);
  }
});

listen(EVT.PaymentFailed, ({ userId, orderId }) => {
  if (!orderId) return;
  const order = db.orders.find((o) => o.id === orderId);
  if (order) {
    notify(userId as number, 'order_status', 'پرداخت ناموفق', `پرداخت سفارش ${order.order_number} انجام نشد؛ می‌توانید دوباره تلاش کنید.`, { orderNumber: order.order_number });
  }
});

listen(EVT.StockDepleted, ({ variantId }) => {
  // اطلاع‌رسانی به مشترکین «موجود شد اطلاع بده» و پاک‌سازی لیست انتظار
  db.stock_alerts
    .filter((a) => a.product_variant_id === variantId)
    .forEach((a) => {
      if (a.user_id) {
        notify(a.user_id, 'back_in_stock', 'تغییر موجودی کالا', 'کالایی که پیگیری می‌کردید تغییر موجودی داد.');
      }
    });
  logActivity(null, 'stock.depleted', 'product_variant', variantId as number, 'اتمام موجودی تنوع محصول');
});
