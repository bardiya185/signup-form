import { db } from '../db';
import { apiError } from '../errors';
import { flushTag } from '../cache';
import {
  logActivity, toUserDto, userNameOf, PAYMENT_METHOD_FA, ORDER_STATUS_FA,
} from '../resources';
import type * as D from '@/types/domain';

const todayKey = () => new Date().toISOString().slice(0, 10);
const MONTH_FA = ['دی', 'بهمن', 'اسفند', 'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر'];
const monthKey = (d: Date) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;

const paidOrders = () => db.orders.filter((o) => o.payment_status === 'paid');

function lastMonths(n: number): Array<{ key: string; label: string }> {
  const today = new Date();
  const out: Array<{ key: string; label: string }> = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - i, 1));
    out.push({ key: monthKey(d), label: MONTH_FA[d.getUTCMonth()] });
  }
  return out;
}

// ─── داشبورد ───
export function dashboard() {
  const paid = paidOrders();
  const paidRevenue = paid.reduce((s, o) => s + o.total_amount, 0);
  const byStatus = Object.fromEntries(
    (['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'] as D.OrderStatus[])
      .map((s) => [s, db.orders.filter((o) => o.status === s).length]),
  );

  const salesChart = lastMonths(6).map((m) => ({
    ...m,
    revenue: paid.filter((o) => monthKey(new Date(o.created_at)) === m.key).reduce((s, o) => s + o.total_amount, 0),
    orders: paid.filter((o) => monthKey(new Date(o.created_at)) === m.key).length,
  }));

  const soldByVariant = new Map<number, { qty: number; revenue: number }>();
  db.order_items.forEach((i) => {
    const order = db.orders.find((o) => o.id === i.order_id);
    if (order?.payment_status !== 'paid') return;
    const cur = soldByVariant.get(i.product_variant_id) ?? { qty: 0, revenue: 0 };
    cur.qty += i.quantity;
    cur.revenue += i.total_price;
    soldByVariant.set(i.product_variant_id, cur);
  });
  const topProducts = [...soldByVariant.entries()]
    .map(([variantId, v]) => {
      const variant = db.product_variants.find((x) => x.id === variantId);
      const product = variant && db.products.find((p) => p.id === variant.product_id);
      if (!product) return null;
      return {
        productId: product.id,
        title: product.title,
        image: db.product_images.find((i) => i.product_id === product.id && i.is_primary)?.image_path ?? null,
        quantity: v.qty,
        revenue: v.revenue,
      };
    })
    .filter((x): x is NonNullable<typeof x> => !!x)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const lowStock = db.product_variants
    .filter((v) => v.is_active && v.stock <= 3)
    .map((v) => {
      const product = db.products.find((p) => p.id === v.product_id)!;
      return { variantId: v.id, sku: v.sku, title: product.title, stock: v.stock };
    })
    .slice(0, 8);

  return {
    cards: {
      totalRevenue: paidRevenue,
      totalOrders: db.orders.length,
      todayOrders: db.orders.filter((o) => o.created_at.startsWith(todayKey())).length,
      totalUsers: db.users.filter((u) => !u.deleted_at).length,
      totalProducts: db.products.filter((p) => !p.deleted_at).length,
      totalSellers: db.sellers.length,
      todayRevenue: paid.filter((o) => o.updated_at.startsWith(todayKey())).reduce((s, o) => s + o.total_amount, 0),
      averageOrderValue: paid.length ? Math.round(paidRevenue / paid.length) : 0,
    },
    ordersByStatus: byStatus,
    salesChart,
    topProducts,
    lowStock,
    pending: {
      products: db.products.filter((p) => p.status === 'pending_review').length,
      reviews: db.reviews.filter((r) => r.status === 'pending').length,
      sellers: db.sellers.filter((s) => s.status === 'pending').length,
      openTickets: db.tickets.filter((t) => t.status === 'open').length,
    },
    recentOrders: [...db.orders]
      .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
      .slice(0, 6)
      .map((o) => ({
        id: o.id,
        orderNumber: o.order_number,
        buyer: userNameOf(o.user_id),
        total: o.total_amount,
        status: o.status,
        statusFa: ORDER_STATUS_FA[o.status],
        createdAt: o.created_at,
      })),
  };
}

// ─── گزارش فروش (روزانه) ───
export function salesReport(days = 14) {
  const buckets = new Map<string, { date: string; orders: number; revenue: number }>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, { date: key, orders: 0, revenue: 0 });
  }
  paidOrders().forEach((o) => {
    const b = buckets.get(o.created_at.slice(0, 10));
    if (b) {
      b.orders += 1;
      b.revenue += o.total_amount;
    }
  });
  const daily = [...buckets.values()];
  return {
    daily,
    totalRevenue: daily.reduce((s, d) => s + d.revenue, 0),
    totalOrders: daily.reduce((s, d) => s + d.orders, 0),
  };
}

// ─── گزارش محصولات ───
export function productsReport() {
  const rows = db.products
    .filter((p) => !p.deleted_at)
    .map((p) => {
      const variants = db.product_variants.filter((v) => v.product_id === p.id);
      const items = db.order_items.filter((i) => {
        const order = db.orders.find((o) => o.id === i.order_id);
        return variants.some((v) => v.id === i.product_variant_id) && order?.payment_status === 'paid';
      });
      return {
        id: p.id,
        title: p.title,
        status: p.status,
        viewCount: p.view_count,
        stock: variants.reduce((s, v) => s + v.stock, 0),
        unitsSold: items.reduce((s, i) => s + i.quantity, 0),
        revenue: items.reduce((s, i) => s + i.total_price, 0),
      };
    })
    .sort((a, b) => b.revenue - a.revenue);
  const topViewed = [...rows].sort((a, b) => b.viewCount - a.viewCount).slice(0, 5);
  return { byRevenue: rows.slice(0, 20), topViewed };
}

// ─── گزارش کاربران ───
export function usersReport() {
  const registrations = lastMonths(6).map((m) => ({
    ...m,
    count: db.users.filter((u) => monthKey(new Date(u.created_at)) === m.key).length,
  }));
  const buyers = db.users
    .filter((u) => !u.deleted_at)
    .map((u) => {
      const orders = db.orders.filter((o) => o.user_id === u.id && o.payment_status === 'paid');
      return {
        id: u.id,
        name: userNameOf(u.id),
        ordersCount: orders.length,
        totalSpent: orders.reduce((s, o) => s + o.total_amount, 0),
      };
    })
    .filter((b) => b.ordersCount > 0)
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5);
  const byRole = {
    customer: db.users.filter((u) => u.role === 'customer').length,
    seller: db.users.filter((u) => u.role === 'seller').length,
    admin: db.users.filter((u) => ['admin', 'super_admin'].includes(u.role)).length,
  };
  return { registrations, topBuyers: buyers, byRole };
}

// ─── گزارش درآمد ───
export function revenueReport() {
  const byMethod = (['zarinpal', 'mellat', 'saman', 'wallet'] as D.PaymentMethod[]).map((method) => ({
    method,
    methodFa: PAYMENT_METHOD_FA[method],
    total: db.payments.filter((p) => p.status === 'success' && p.method === method && p.order_id != null).reduce((s, p) => s + p.amount, 0),
    count: db.payments.filter((p) => p.status === 'success' && p.method === method && p.order_id != null).length,
  }));
  const monthly = lastMonths(6).map((m) => ({
    ...m,
    revenue: db.payments
      .filter((p) => p.status === 'success' && p.order_id != null && p.paid_at && monthKey(new Date(p.paid_at)) === m.key)
      .reduce((s, p) => s + p.amount, 0),
  }));
  const refunded = db.payments.filter((p) => p.status === 'refunded').reduce((s, p) => s + p.amount, 0);
  return { byMethod, monthly, refunded, walletDeposits: db.payments.filter((p) => p.status === 'success' && p.order_id == null).reduce((s, p) => s + p.amount, 0) };
}

// ─── تنظیمات ───
const SETTINGS_KEYS = [
  'site_name', 'site_description', 'support_phone', 'support_email',
  'free_shipping_threshold', 'default_shipping_method_id', 'return_period_days',
  'incredible_offers_enabled', 'maintenance_mode',
];

export const getSettings = () => ({ ...db.settings });

export function updateSettings(admin: D.User, patch: Record<string, string>) {
  for (const key of Object.keys(patch)) {
    if (SETTINGS_KEYS.includes(key)) db.settings[key] = String(patch[key]);
  }
  logActivity(admin.id, 'settings.update', null, null, 'بروزرسانی تنظیمات سایت');
  flushTag('settings');
  flushTag('home');
  return getSettings();
}

// ─── مدیریت کاربران ───
export function listUsers(filters: { q?: string; role?: string; status?: string; page: number; perPage: number }) {
  let list = db.users.filter((u) => !u.deleted_at);
  if (filters.q) {
    const q = filters.q.trim().toLowerCase();
    list = list.filter((u) =>
      `${u.first_name} ${u.last_name}`.includes(filters.q!.trim()) ||
      u.phone.includes(filters.q!.trim()) ||
      (u.email ?? '').toLowerCase().includes(q));
  }
  if (filters.role) list = list.filter((u) => u.role === filters.role);
  if (filters.status) list = list.filter((u) => u.status === filters.status);
  list = [...list].sort((a, b) => b.id - a.id);
  const rows = list.map((u) => {
    const orders = db.orders.filter((o) => o.user_id === u.id && o.payment_status === 'paid');
    return {
      ...toUserDto(u),
      ordersCount: orders.length,
      totalSpent: orders.reduce((s, o) => s + o.total_amount, 0),
    };
  });
  return { items: rows.slice((filters.page - 1) * filters.perPage, filters.page * filters.perPage), total: rows.length };
}

export function updateUserStatus(admin: D.User, userId: number, status: D.UserStatus) {
  const user = db.users.find((u) => u.id === userId && !u.deleted_at);
  if (!user) throw apiError(404, 'کاربر یافت نشد');
  if (user.id === admin.id) {
    throw apiError(422, 'نمی‌توانید وضعیت حساب خودتان را تغییر دهید');
  }
  user.status = status;
  user.updated_at = new Date().toISOString();
  logActivity(admin.id, `user.${status}`, 'user', user.id, `وضعیت کاربر ${userNameOf(user.id)} به «${status}» تغییر یافت`);
  return toUserDto(user);
}
