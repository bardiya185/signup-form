/**
 * ─── سرویس انبار (Warehouse) ───
 * معادل WarehouseController لاراول: داشبورد، موجودی، تعدیل استوک با لاگ گردش،
 * سفارش‌های آماده ارسال و خروج از انبار.
 */
import { db, nextId } from '@/server/db';
import { err404, err422 } from '@/server/errors';
import { logActivity, notify, ORDER_STATUS_FA, userNameOf } from '@/server/resources';
import type * as D from '@/types/domain';

const now = () => new Date().toISOString();

interface VariantRow {
  variantId: number;
  sku: string;
  productId: number;
  productTitle: string;
  productSlug: string;
  image: string | null;
  color: D.Color | null;
  guarantee: string | null;
  price: number;
  salePrice: number | null;
  stock: number;
  isActive: boolean;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

function variantRow(v: D.ProductVariant): VariantRow | null {
  const product = db.products.find((p) => p.id === v.product_id && !p.deleted_at);
  if (!product) return null;
  const image = db.product_images.find((i) => i.product_id === product.id && i.is_primary)?.image_path ?? null;
  const color = v.color_id ? db.colors.find((c) => c.id === v.color_id) ?? null : null;
  const guarantee = v.guarantee_id ? db.guarantees.find((g) => g.id === v.guarantee_id)?.title ?? null : null;
  return {
    variantId: v.id,
    sku: v.sku,
    productId: product.id,
    productTitle: product.title,
    productSlug: product.slug,
    image,
    color,
    guarantee,
    price: v.price,
    salePrice: v.sale_price,
    stock: v.stock,
    isActive: v.is_active,
    status: v.stock <= 0 ? 'out_of_stock' : v.stock <= 3 ? 'low_stock' : 'in_stock',
  };
}

// ─── داشبورد انبار ───
export function warehouseDashboard() {
  const variants = db.product_variants.filter((v) => v.is_active);
  const rows = variants.map(variantRow).filter((r): r is VariantRow => !!r);

  const weeklyAgo = new Date(Date.now() - 7 * 86400_000).toISOString();
  const toShip = db.orders.filter((o) => o.status === 'processing');
  const shippedThisWeek = db.orders.filter((o) => o.status === 'shipped' && (o.shipped_at ?? '') >= weeklyAgo);

  return {
    stats: {
      totalVariants: rows.length,
      totalStockUnits: rows.reduce((s, r) => s + r.stock, 0),
      stockValue: rows.reduce((s, r) => s + r.stock * (r.salePrice ?? r.price), 0),
      lowStockCount: rows.filter((r) => r.status === 'low_stock').length,
      outOfStockCount: rows.filter((r) => r.status === 'out_of_stock').length,
      pendingShipments: toShip.length,
      shippedThisWeek: shippedThisWeek.length,
      movementsToday: db.stock_movements.filter((m) => m.created_at.startsWith(now().slice(0, 10))).length,
    },
    lowStock: rows.filter((r) => r.status !== 'in_stock').sort((a, b) => a.stock - b.stock).slice(0, 10),
    readyShipments: db.orders
      .filter((o) => o.status === 'processing')
      .sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at))
      .slice(0, 6)
      .map((o) => ({
        id: o.id,
        orderNumber: o.order_number,
        buyer: userNameOf(o.user_id),
        itemsCount: db.order_items.filter((i) => i.order_id === o.id).reduce((s, i) => s + i.quantity, 0),
        total: o.total_amount,
        createdAt: o.created_at,
      })),
    recentMovements: movementRows(8),
  };
}

// ─── لیست موجودی ───
export function inventoryList(filters: { q?: string; state?: string; page: number; perPage: number }) {
  let rows = db.product_variants
    .filter((v) => v.is_active)
    .map(variantRow)
    .filter((r): r is VariantRow => !!r);

  if (filters.q) {
    const q = filters.q.trim();
    rows = rows.filter((r) => r.productTitle.includes(q) || r.sku.toLowerCase().includes(q.toLowerCase()));
  }
  if (filters.state && filters.state !== 'all') {
    rows = rows.filter((r) => r.status === filters.state);
  }
  rows.sort((a, b) => a.stock - b.stock || b.variantId - a.variantId);
  return {
    items: rows.slice((filters.page - 1) * filters.perPage, filters.page * filters.perPage),
    total: rows.length,
  };
}

// ─── تعدیل موجودی با لاگ گردش ───
export function adjustStock(user: D.User, variantId: number, newStock: number, reason?: string) {
  const variant = db.product_variants.find((v) => v.id === variantId);
  if (!variant || !variant.is_active) throw err404('تنوع محصول یافت نشد');
  if (!Number.isInteger(newStock) || newStock < 0 || newStock > 1_000_000) {
    throw err422({ stock: ['مقدار موجودی باید عدد صحیح بین ۰ تا ۱,۰۰۰,۰۰۰ باشد'] });
  }
  const oldStock = variant.stock;
  if (oldStock === newStock) throw err422({ stock: ['موجودی جدید با مقدار فعلی برابر است'] });

  variant.stock = newStock;
  variant.updated_at = now();
  const product = db.products.find((p) => p.id === variant.product_id);

  const movement: D.StockMovement = {
    id: nextId(db.stock_movements),
    product_variant_id: variant.id,
    old_stock: oldStock,
    new_stock: newStock,
    delta: newStock - oldStock,
    reason: reason?.trim() || (newStock > oldStock ? 'ورود کالا به انبار' : 'خروج کالا از انبار'),
    changed_by: user.id,
    created_at: now(),
  };
  db.stock_movements.push(movement);
  logActivity(
    user.id, 'warehouse.stock_adjust', 'ProductVariant', variant.id,
    `موجودی «${product?.title ?? variant.sku}» از ${oldStock} به ${newStock} تغییر یافت`,
  );

  // اطلاع‌رسانی به مشترکین «موجود شد خبرم کن» وقتی ناموجود → موجود می‌شود
  if (oldStock === 0 && newStock > 0) {
    db.stock_alerts
      .filter((a) => a.product_variant_id === variant.id)
      .forEach((a) => {
        if (a.user_id) {
          notify(
            a.user_id, 'back_in_stock',
            'کالای موردنظر شما موجود شد 🎉',
            `«${product?.title ?? 'کالا'}» دوباره در انبار موجود است؛ قبل از اتمام خرید کنید.`,
            { product_slug: product?.slug ?? null },
          );
        }
      });
    db.stock_alerts = db.stock_alerts.filter((a) => a.product_variant_id !== variant.id);
  }

  return variantRow(variant);
}

// ─── سفارش‌های آماده ارسال از انبار ───
export function shipmentsList(state: 'ready' | 'shipped', page: number, perPage: number) {
  const status = state === 'ready' ? 'processing' : 'shipped';
  const list = db.orders
    .filter((o) => o.status === status)
    .sort((a, b) => (state === 'ready' ? +new Date(a.created_at) - +new Date(b.created_at) : +new Date(b.shipped_at ?? b.updated_at) - +new Date(a.shipped_at ?? a.updated_at)));
  const rows = list.map((o) => {
    const address = db.addresses.find((a) => a.id === o.address_id);
    return {
      id: o.id,
      orderNumber: o.order_number,
      status: o.status,
      statusFa: ORDER_STATUS_FA[o.status],
      buyer: userNameOf(o.user_id),
      destination: address
        ? `${db.provinces.find((p) => p.id === address.province_id)?.name ?? ''}، ${db.cities.find((c) => c.id === address.city_id)?.name ?? ''}`
        : '—',
      itemsCount: db.order_items.filter((i) => i.order_id === o.id).reduce((s, i) => s + i.quantity, 0),
      items: db.order_items
        .filter((i) => i.order_id === o.id)
        .map((i) => ({ id: i.id, title: i.product_title, variantInfo: i.variant_info, quantity: i.quantity })),
      total: o.total_amount,
      createdAt: o.created_at,
      shippedAt: o.shipped_at,
    };
  });
  return { items: rows.slice((page - 1) * perPage, page * perPage), total: rows.length };
}

/** خروج سفارش از انبار: processing → shipped */
export function shipOrder(user: D.User, orderId: number) {
  const order = db.orders.find((o) => o.id === orderId);
  if (!order) throw err404('سفارش یافت نشد');
  if (order.status !== 'processing') {
    throw err422({ status: ['فقط سفارش‌های «در حال پردازش» قابل خروج از انبار هستند'] });
  }
  order.status = 'shipped';
  order.shipped_at = now();
  order.updated_at = now();
  db.order_status_history.push({
    id: nextId(db.order_status_history),
    order_id: order.id, old_status: 'processing', new_status: 'shipped',
    description: 'سفارش از انبار خارج و به واحد ارسال تحویل داده شد',
    changed_by: user.id, created_at: now(), updated_at: now(),
  });
  notify(
    order.user_id, 'order_status', 'سفارش شما ارسال شد 📦',
    `سفارش ${order.order_number} از انبار گینان‌کالا خارج شد و به‌زودی به دستتان می‌رسد.`,
    { order_id: order.id, order_number: order.order_number },
  );
  logActivity(user.id, 'warehouse.ship_order', 'Order', order.id, `خروج سفارش ${order.order_number} از انبار`);
  return {
    id: order.id,
    orderNumber: order.order_number,
    status: order.status,
    statusFa: ORDER_STATUS_FA[order.status],
    shippedAt: order.shipped_at,
  };
}

// ─── گزارش گردش موجودی ───
function movementRow(m: D.StockMovement) {
  const variant = db.product_variants.find((v) => v.id === m.product_variant_id);
  const product = variant && db.products.find((p) => p.id === variant.product_id);
  return {
    id: m.id,
    sku: variant?.sku ?? '—',
    productTitle: product?.title ?? '—',
    oldStock: m.old_stock,
    newStock: m.new_stock,
    delta: m.delta,
    reason: m.reason,
    changedBy: m.changed_by ? userNameOf(m.changed_by) : 'سیستم',
    createdAt: m.created_at,
  };
}

export function movementRows(limit: number) {
  return [...db.stock_movements].sort((a, b) => b.id - a.id).slice(0, limit).map(movementRow);
}

export function movementLog(page: number, perPage: number) {
  const all = [...db.stock_movements].sort((a, b) => b.id - a.id);
  const rows = all.slice((page - 1) * perPage, page * perPage).map(movementRow);
  return { items: rows, total: all.length };
}
