/**
 * سیستم رویداد سبک Laravel Events & Listeners.
 * emit('order.placed', {...}) → همه listener های ثبت‌شده اجرا می‌شوند.
 * listener ها در src/server/listeners.ts ثبت می‌شوند (معادل EventServiceProvider).
 */

export type EventPayload = Record<string, unknown>;
type Listener = (payload: EventPayload) => void;

const listeners = new Map<string, Listener[]>();

export function listen(event: string, listener: Listener): void {
  const list = listeners.get(event) ?? [];
  list.push(listener);
  listeners.set(event, list);
}

export function emit(event: string, payload: EventPayload): void {
  for (const listener of listeners.get(event) ?? []) {
    try {
      listener(payload);
    } catch (e) {
      console.error(`[EVENT ${event}] listener failed:`, e);
    }
  }
}

// نام رویدادها — معادل کلاس‌های OrderPlaced, PaymentVerified, ...
export const EVT = {
  UserRegistered: 'user.registered',
  ProductViewed: 'product.viewed',
  OrderPlaced: 'order.placed',
  OrderStatusChanged: 'order.status_changed',
  PaymentVerified: 'payment.verified',
  PaymentFailed: 'payment.failed',
  StockDepleted: 'stock.depleted',
} as const;
