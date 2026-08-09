import { db, nextId } from '../db';
import { apiError, err404, err422 } from '../errors';
import { flushTag } from '../cache';
import {
  logActivity, toSellerDto, toSettlementDto, userNameOf,
} from '../resources';
import { toProductCardDto } from '../serializers';
import type * as D from '@/types/domain';

const now = () => new Date().toISOString();

// ─── ثبت‌نام فروشنده ───
export function registerSeller(user: D.User, input: {
  shop_name: string; national_id: string; phone: string; email: string;
  province_id: number; city_id: number; address: string; shaba_number: string;
}) {
  const existing = db.sellers.find((s) => s.user_id === user.id);
  if (existing) throw apiError(409, 'شما قبلاً درخواست فروشندگی ثبت کرده‌اید');
  const taken = db.sellers.some((s) => s.shop_name === input.shop_name);
  if (taken) throw err422({ shop_name: ['این نام فروشگاه قبلاً ثبت شده است'] });

  const seller: D.Seller = {
    id: nextId(db.sellers), user_id: user.id,
    shop_name: input.shop_name,
    slug: input.shop_name.replace(/\s+/g, '-').toLowerCase() + '-' + nextId(db.sellers),
    logo: null, description: null,
    national_id: input.national_id, phone: input.phone, email: input.email,
    province_id: input.province_id, city_id: input.city_id,
    address: input.address, shaba_number: input.shaba_number,
    commission_rate: 8, status: 'pending', rating: 0,
    created_at: now(), updated_at: now(),
  };
  db.sellers.push(seller);
  logActivity(user.id, 'seller.register', 'seller', seller.id, `ثبت درخواست فروشندگی «${seller.shop_name}»`);
  return toSellerDto(seller);
}

// ─── سرویس‌های فروشنده جاری ───
export function mySeller(user: D.User): D.Seller {
  const seller = db.sellers.find((s) => s.user_id === user.id);
  if (!seller) throw err404('برای دسترسی به پنل فروشندگی ابتدا درخواست خود را ثبت کنید');
  return seller;
}

const sellerVariantIds = (sellerId: number): number[] =>
  db.product_variants
    .filter((v) => db.products.some((p) => p.id === v.product_id && p.seller_id === sellerId))
    .map((v) => v.id);

export interface SellerProductInput {
  title: string;
  category_id: number;
  brand_id?: number;
  price: number;
  sale_price?: number | null;
  stock: number;
  color_id?: number | null;
  guarantee_id?: number | null;
  short_description?: string;
  image?: string | null;
}

/** ساخت محصول جدید — در فرم فروشنده و ادمین مشترک */
export function createProductRecord(input: SellerProductInput, sellerId: number, status: D.ProductStatus = 'pending_review'): D.Product {
  const category = db.categories.find((c) => c.id === input.category_id);
  if (!category) throw err422({ category_id: ['دسته‌بندی معتبر نیست'] });
  if (input.brand_id != null && !db.brands.some((b) => b.id === input.brand_id)) {
    throw err422({ brand_id: ['برند معتبر نیست'] });
  }
  if (input.sale_price != null && input.sale_price >= input.price) {
    throw err422({ sale_price: ['قیمت فروش ویژه باید کمتر از قیمت اصلی باشد'] });
  }
  const id = nextId(db.products);
  const slugBase = input.title.replace(/[\sـ]+/g, '-').replace(/[؟?]/g, '').slice(0, 40);
  const product: D.Product = {
    id, category_id: input.category_id, brand_id: input.brand_id ?? null,
    seller_id: sellerId, title: input.title,
    slug: `${slugBase}-${id}`,
    sku: `GNK-${String(id).padStart(5, '0')}`,
    short_description: input.short_description ?? null, body: input.short_description ?? null,
    status, is_featured: false, is_digital: false,
    weight: null, dimensions: null,
    meta_title: input.title, meta_description: input.short_description ?? null,
    view_count: 0, created_at: now(), updated_at: now(), deleted_at: null,
  };
  db.products.push(product);
  db.product_variants.push({
    id: nextId(db.product_variants), product_id: id,
    sku: `GNK-V${String(id).padStart(4, '0')}`,
    price: input.price, sale_price: input.sale_price ?? null,
    stock: input.stock, max_per_order: 3,
    color_id: input.color_id ?? null, size_id: null,
    guarantee_id: input.guarantee_id ?? 4,
    is_active: true, created_at: now(), updated_at: now(),
  });
  if (input.image) {
    db.product_images.push({
      id: nextId(db.product_images), product_id: id, image_path: input.image,
      alt_text: input.title, sort_order: 0, is_primary: true, created_at: now(), updated_at: now(),
    });
  }
  flushTag('products');
  flushTag('home');
  return product;
}

export function sellerDashboard(user: D.User) {
  const seller = mySeller(user);
  const products = db.products.filter((p) => p.seller_id === seller.id && !p.deleted_at);
  const variantIds = sellerVariantIds(seller.id);
  const paidOrderIds = new Set(db.orders.filter((o) => o.payment_status === 'paid').map((o) => o.id));
  const soldItems = db.order_items.filter(
    (i) => variantIds.includes(i.product_variant_id) && paidOrderIds.has(i.order_id),
  );
  const revenue = soldItems.reduce((s, i) => s + i.total_price, 0);
  const pendingSettlement = db.seller_settlements
    .filter((s) => s.seller_id === seller.id && s.status === 'pending')
    .reduce((s, x) => s + x.amount, 0);

  const recent = soldItems
    .sort((a, b) => db.order_items.indexOf(b) - db.order_items.indexOf(a))
    .slice(-5)
    .reverse()
    .map((i) => {
      const order = db.orders.find((o) => o.id === i.order_id)!;
      return {
        orderNumber: order.order_number,
        itemTitle: i.product_title,
        quantity: i.quantity,
        total: i.total_price,
        buyer: userNameOf(order.user_id),
        createdAt: order.created_at,
      };
    });

  return {
    seller: toSellerDto(seller),
    stats: {
      productsTotal: products.length,
      productsActive: products.filter((p) => p.status === 'active').length,
      productsPending: products.filter((p) => p.status === 'pending_review').length,
      unitsSold: soldItems.reduce((s, i) => s + i.quantity, 0),
      ordersCount: new Set(soldItems.map((i) => i.order_id)).size,
      totalRevenue: revenue,
      pendingSettlement,
      rating: seller.rating,
    },
    recentSales: recent,
  };
}

export function sellerProducts(user: D.User, page: number, perPage: number) {
  const seller = mySeller(user);
  const list = db.products
    .filter((p) => p.seller_id === seller.id && !p.deleted_at)
    .sort((a, b) => b.id - a.id);
  return {
    items: list.slice((page - 1) * perPage, page * perPage).map((p) => ({
      ...toProductCardDto(p),
      status: p.status,
    })),
    total: list.length,
  };
}

export function sellerCreateProduct(user: D.User, input: SellerProductInput) {
  const seller = mySeller(user);
  if (seller.status !== 'approved') {
    throw apiError(403, 'فروشگاه شما هنوز تایید نشده است و امکان ثبت محصول ندارید');
  }
  const product = createProductRecord(input, seller.id, 'pending_review');
  logActivity(user.id, 'seller.product_create', 'product', product.id, `ثبت محصول «${product.title}»`);
  return { id: product.id, slug: product.slug };
}

export function sellerUpdateProduct(user: D.User, productId: number, input: Partial<SellerProductInput>) {
  const seller = mySeller(user);
  const product = db.products.find((p) => p.id === productId && p.seller_id === seller.id && !p.deleted_at);
  if (!product) throw err404('محصول مورد نظر یافت نشد');
  if (input.title) product.title = input.title;
  if (input.short_description !== undefined) product.short_description = input.short_description;

  const variant = db.product_variants.find((v) => v.product_id === product.id);
  if (variant) {
    if (input.price != null && input.price !== variant.price) {
      db.product_price_history.push({
        id: nextId(db.product_price_history), product_variant_id: variant.id,
        old_price: variant.price, new_price: input.price, created_at: now(), updated_at: now(),
      });
      variant.price = input.price;
    }
    if (input.sale_price !== undefined) variant.sale_price = input.sale_price;
    if (input.stock != null) variant.stock = input.stock;
  }
  product.updated_at = now();
  flushTag('products');
  return toProductCardDto(product);
}

export function sellerOrders(user: D.User) {
  const seller = mySeller(user);
  const variantIds = sellerVariantIds(seller.id);
  const paidOrderIds = new Set(db.orders.filter((o) => o.payment_status === 'paid').map((o) => o.id));
  return db.order_items
    .filter((i) => variantIds.includes(i.product_variant_id) && paidOrderIds.has(i.order_id))
    .map((i) => {
      const order = db.orders.find((o) => o.id === i.order_id)!;
      return {
        id: i.id,
        orderNumber: order.order_number,
        orderStatus: order.status,
        itemTitle: i.product_title,
        variantInfo: i.variant_info,
        quantity: i.quantity,
        unitPrice: i.unit_price,
        total: i.total_price,
        buyer: userNameOf(order.user_id),
        createdAt: order.created_at,
      };
    })
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export function sellerSettlements(user: D.User) {
  const seller = mySeller(user);
  return db.seller_settlements
    .filter((s) => s.seller_id === seller.id)
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
    .map(toSettlementDto);
}

const MONTH_FA = ['دی', 'بهمن', 'اسفند', 'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر'];
const monthKey = (d: Date) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;

export function sellerAnalytics(user: D.User) {
  const seller = mySeller(user);
  const variantIds = sellerVariantIds(seller.id);
  const paidOrderIds = new Set(db.orders.filter((o) => o.payment_status === 'paid').map((o) => o.id));
  const items = db.order_items.filter(
    (i) => variantIds.includes(i.product_variant_id) && paidOrderIds.has(i.order_id),
  );

  const months: Array<{ key: string; label: string; revenue: number; units: number }> = [];
  const today = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - i, 1));
    months.push({ key: monthKey(d), label: MONTH_FA[d.getUTCMonth()], revenue: 0, units: 0 });
  }
  items.forEach((i) => {
    const order = db.orders.find((o) => o.id === i.order_id)!;
    const bucket = months.find((m) => m.key === monthKey(new Date(order.created_at)));
    if (bucket) {
      bucket.revenue += i.total_price;
      bucket.units += i.quantity;
    }
  });

  const byProduct = new Map<number, { title: string; revenue: number; units: number }>();
  items.forEach((i) => {
    const variant = db.product_variants.find((v) => v.id === i.product_variant_id);
    if (!variant) return;
    const current = byProduct.get(variant.product_id) ?? { title: i.product_title, revenue: 0, units: 0 };
    current.revenue += i.total_price;
    current.units += i.quantity;
    byProduct.set(variant.product_id, current);
  });

  return {
    monthly: months,
    topProducts: [...byProduct.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5),
    commissionRate: seller.commission_rate,
    netRevenue: items.reduce((s, i) => s + i.total_price, 0) * (1 - seller.commission_rate / 100),
  };
}
