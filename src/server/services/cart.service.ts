import { db, nextId } from '../db';
import { err404, err422 } from '../errors';
import { resolveOwner, type Owner } from '../guards';
import { effectivePriceOf, toVariantDto } from '../serializers';
import type { CartDto, CartItemDto, CartTotals } from '../resources';
import type * as D from '@/types/domain';

const now = () => new Date().toISOString();

const findCart = (owner: Owner): D.Cart | undefined =>
  db.carts.find((c) => (owner.userId ? c.user_id === owner.userId : c.session_id === owner.sessionId));

const ensureCart = (owner: Owner): D.Cart => {
  const existing = findCart(owner);
  if (existing) return existing;
  const cart: D.Cart = {
    id: nextId(db.carts), user_id: owner.userId, session_id: owner.sessionId,
    coupon_id: null, created_at: now(), updated_at: now(),
  };
  db.carts.push(cart);
  return cart;
};

const itemsOf = (cart: D.Cart) => db.cart_items.filter((i) => i.cart_id === cart.id);

const variantOr404 = (variantId: number): D.ProductVariant => {
  const variant = db.product_variants.find((v) => v.id === variantId && v.is_active);
  if (!variant) throw err404('تنوع محصول مورد نظر یافت نشد');
  if (variant.stock <= 0) throw err422({ product_variant_id: ['این کالا در حال حاضر موجود نیست'] });
  return variant;
};

const guardQuantity = (variant: D.ProductVariant, quantity: number, alreadyInCart = 0) => {
  const total = quantity + alreadyInCart;
  if (total > variant.stock) {
    throw err422({ quantity: [`حداکثر موجودی این کالا ${variant.stock} عدد است`] });
  }
  if (total > variant.max_per_order) {
    throw err422({ quantity: [`حداکثر تعداد قابل سفارش این کالا ${variant.max_per_order} عدد است`] });
  }
};

// ─── کوپن ───
export function computeCouponDiscount(coupon: D.Coupon, items: D.CartItem[]): number {
  let eligible = items;
  if (coupon.applicable_products?.length) {
    eligible = eligible.filter((i) => {
      const variant = db.product_variants.find((v) => v.id === i.product_variant_id);
      return variant && coupon.applicable_products!.includes(variant.product_id);
    });
  }
  if (coupon.applicable_categories?.length) {
    eligible = eligible.filter((i) => {
      const variant = db.product_variants.find((v) => v.id === i.product_variant_id);
      const product = variant && db.products.find((p) => p.id === variant.product_id);
      return product && coupon.applicable_categories!.includes(product.category_id);
    });
  }
  const eligibleSubtotal = eligible.reduce((sum, i) => {
    const variant = db.product_variants.find((v) => v.id === i.product_variant_id);
    return sum + (variant ? effectivePriceOf(variant) * i.quantity : 0);
  }, 0);
  if (eligibleSubtotal <= 0) return 0;
  if (coupon.type === 'percentage') {
    const raw = Math.floor((eligibleSubtotal * coupon.value) / 100);
    return coupon.max_discount != null ? Math.min(raw, coupon.max_discount) : raw;
  }
  return Math.min(coupon.value, eligibleSubtotal);
}

function assertCouponUsable(coupon: D.Coupon, owner: Owner, subtotal: number): void {
  if (!coupon.is_active) throw err422({ code: ['این کد تخفیف غیرفعال است'] });
  const n = new Date();
  if (coupon.starts_at && new Date(coupon.starts_at) > n) throw err422({ code: ['این کد تخفیف هنوز فعال نشده است'] });
  if (coupon.expires_at && new Date(coupon.expires_at) < n) throw err422({ code: ['مهلت استفاده از این کد تخفیف به پایان رسیده است'] });
  if (coupon.usage_limit != null && coupon.used_count >= coupon.usage_limit) throw err422({ code: ['ظرفیت استفاده از این کد تخفیف تکمیل شده است'] });
  if (coupon.min_order_amount != null && subtotal < coupon.min_order_amount) {
    throw err422({ code: [`حداقل مبلغ سفارش برای این کد ${coupon.min_order_amount.toLocaleString('fa-IR')} تومان است`] });
  }
  if (owner.userId) {
    const usedByUser = db.orders.filter((o) => o.user_id === owner.userId && o.coupon_id === coupon.id).length;
    if (usedByUser >= coupon.per_user_limit) throw err422({ code: ['شما قبلاً از این کد تخفیف استفاده کرده‌اید'] });
  }
}

// ─── خروجی سبد ───
export function buildCartDto(cart: D.Cart | null): CartDto {
  const threshold = Number(db.settings.free_shipping_threshold ?? 2000000);
  if (!cart) {
    return {
      id: null, items: [],
      totals: {
        itemsCount: 0, subtotal: 0, discount: 0, couponDiscount: 0, couponCode: null,
        shippingCost: null, total: 0, freeShippingThreshold: threshold, remainingForFreeShipping: threshold,
      },
    };
  }

  const rows = itemsOf(cart);
  const items: CartItemDto[] = [];
  for (const row of rows) {
    const variant = db.product_variants.find((v) => v.id === row.product_variant_id);
    if (!variant) continue;
    const product = db.products.find((p) => p.id === variant.product_id);
    if (!product) continue;
    const image = db.product_images.find((i) => i.product_id === product.id && i.is_primary)?.image_path
      ?? db.product_images.find((i) => i.product_id === product.id)?.image_path ?? '';
    const unitPrice = effectivePriceOf(variant);
    items.push({
      id: row.id,
      product: { id: product.id, slug: product.slug, title: product.title, image },
      variant: toVariantDto(variant),
      quantity: row.quantity,
      unitPrice,
      totalPrice: unitPrice * row.quantity,
    });
  }

  const subtotal = items.reduce((s, i) => s + i.totalPrice, 0);
  const coupon = cart.coupon_id ? db.coupons.find((c) => c.id === cart.coupon_id) : null;
  const couponDiscount = coupon ? computeCouponDiscount(coupon, rows) : 0;
  const total = Math.max(0, subtotal - couponDiscount);

  const totals: CartTotals = {
    itemsCount: items.reduce((s, i) => s + i.quantity, 0),
    subtotal,
    discount: items.reduce((s, i) => s + (i.variant.price - i.unitPrice) * i.quantity, 0),
    couponDiscount,
    couponCode: coupon?.code ?? null,
    shippingCost: null, // هنگام تسویه با انتخاب روش ارسال محاسبه می‌شود
    total,
    freeShippingThreshold: threshold,
    remainingForFreeShipping: Math.max(0, threshold - subtotal),
  };
  return { id: cart.id, items, totals };
}

// ─── عملیات ───
export const getCart = (req: Request): CartDto => buildCartDto(findCart(resolveOwner(req)) ?? null);

export function addItem(req: Request, productVariantId: number, quantity: number): CartDto {
  const variant = variantOr404(productVariantId);
  const owner = resolveOwner(req);
  const cart = ensureCart(owner);
  const existing = db.cart_items.find((i) => i.cart_id === cart.id && i.product_variant_id === variant.id);
  guardQuantity(variant, quantity, existing?.quantity ?? 0);
  if (existing) {
    existing.quantity += quantity;
    existing.updated_at = now();
  } else {
    db.cart_items.push({ id: nextId(db.cart_items), cart_id: cart.id, product_variant_id: variant.id, quantity, created_at: now(), updated_at: now() });
  }
  return buildCartDto(cart);
}

export function updateItem(req: Request, itemId: number, quantity: number): CartDto {
  const owner = resolveOwner(req);
  const cart = findCart(owner);
  const item = cart && db.cart_items.find((i) => i.id === itemId && i.cart_id === cart.id);
  if (!cart || !item) throw err404('آیتم مورد نظر در سبد خرید یافت نشد');
  if (quantity <= 0) {
    db.cart_items = db.cart_items.filter((i) => i.id !== itemId);
    return buildCartDto(cart);
  }
  const variant = variantOr404(item.product_variant_id);
  guardQuantity(variant, quantity);
  item.quantity = quantity;
  item.updated_at = now();
  return buildCartDto(cart);
}

export function removeItem(req: Request, itemId: number): CartDto {
  const owner = resolveOwner(req);
  const cart = findCart(owner);
  if (!cart) throw err404('سبد خرید یافت نشد');
  const exists = db.cart_items.some((i) => i.id === itemId && i.cart_id === cart.id);
  if (!exists) throw err404('آیتم مورد نظر در سبد خرید یافت نشد');
  db.cart_items = db.cart_items.filter((i) => i.id !== itemId);
  return buildCartDto(cart);
}

export function clearCart(req: Request): CartDto {
  const owner = resolveOwner(req);
  const cart = findCart(owner);
  if (cart) {
    db.cart_items = db.cart_items.filter((i) => i.cart_id !== cart.id);
    cart.coupon_id = null;
  }
  return buildCartDto(cart ?? null);
}

export function applyCoupon(req: Request, code: string): CartDto {
  const owner = resolveOwner(req);
  const cart = findCart(owner);
  if (!cart || !itemsOf(cart).length) throw err422({ code: ['سبد خرید شما خالی است'] });
  const coupon = db.coupons.find((c) => c.code.toLowerCase() === code.trim().toLowerCase());
  if (!coupon) throw err422({ code: ['کد تخفیف معتبر نیست'] });
  const subtotal = buildCartDto(cart).totals.subtotal;
  assertCouponUsable(coupon, owner, subtotal);
  if (computeCouponDiscount(coupon, itemsOf(cart)) <= 0) {
    throw err422({ code: ['این کد تخفیف برای اقلام سبد شما قابل استفاده نیست'] });
  }
  cart.coupon_id = coupon.id;
  return buildCartDto(cart);
}

export function removeCoupon(req: Request): CartDto {
  const owner = resolveOwner(req);
  const cart = findCart(owner);
  if (cart) cart.coupon_id = null;
  return buildCartDto(cart ?? null);
}

// داخلی — برای تسویه حساب
export const findCartForUser = (userId: number): D.Cart | undefined =>
  db.carts.find((c) => c.user_id === userId);
export const cartItemsOf = (cartId: number): D.CartItem[] =>
  db.cart_items.filter((i) => i.cart_id === cartId);
export function emptyUserCart(cart: D.Cart): void {
  db.cart_items = db.cart_items.filter((i) => i.cart_id !== cart.id);
  cart.coupon_id = null;
}
