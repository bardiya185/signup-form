import { db, nextId } from '../db';
import { err404, err422 } from '../errors';
import { flushTag } from '../cache';
import { logActivity, notify, toCouponDto, toSellerDto } from '../resources';
import { toReviewAdminRow, toUserishBanner } from './admin-helpers';
import { createProductRecord, type SellerProductInput } from './seller.service';
import { effectivePriceOf } from '../serializers';
import type * as D from '@/types/domain';

const now = () => new Date().toISOString();

// ═══════════ محصولات ═══════════
export function adminListProducts(filters: { q?: string; status?: string; category?: string; page: number; perPage: number }) {
  let list = db.products.filter((p) => !p.deleted_at);
  if (filters.q) list = list.filter((p) => p.title.includes(filters.q!.trim()) || p.sku.includes(filters.q!.trim()));
  if (filters.status) list = list.filter((p) => p.status === filters.status);
  if (filters.category) {
    const cat = db.categories.find((c) => c.slug === filters.category);
    if (cat) list = list.filter((p) => p.category_id === cat.id);
  }
  list = [...list].sort((a, b) => b.id - a.id);
  const rows = list.map((p) => {
    const variants = db.product_variants.filter((v) => v.product_id === p.id && v.is_active);
    const prices = variants.map((v) => effectivePriceOf(v));
    return {
      id: p.id,
      title: p.title,
      slug: p.slug,
      sku: p.sku,
      status: p.status,
      isFeatured: p.is_featured,
      image: db.product_images.find((i) => i.product_id === p.id && i.is_primary)?.image_path ?? null,
      categoryTitle: db.categories.find((c) => c.id === p.category_id)?.title ?? null,
      brandTitle: db.brands.find((b) => b.id === p.brand_id)?.title ?? null,
      sellerTitle: db.sellers.find((s) => s.id === p.seller_id)?.shop_name ?? null,
      price: prices.length ? Math.min(...prices) : 0,
      stock: variants.reduce((s, v) => s + v.stock, 0),
      viewCount: p.view_count,
      createdAt: p.created_at,
    };
  });
  return { items: rows.slice((filters.page - 1) * filters.perPage, filters.page * filters.perPage), total: rows.length };
}

export function adminCreateProduct(admin: D.User, input: SellerProductInput & { status?: D.ProductStatus; seller_id?: number }) {
  const product = createProductRecord(input, input.seller_id ?? 1, input.status ?? 'active');
  logActivity(admin.id, 'product.create', 'product', product.id, `ایجاد محصول «${product.title}»`);
  return { id: product.id, slug: product.slug };
}

export function adminUpdateProduct(admin: D.User, productId: number, input: {
  title?: string; status?: D.ProductStatus; is_featured?: boolean; short_description?: string;
  variants?: Array<{ id: number; price?: number; sale_price?: number | null; stock?: number }>;
}) {
  const product = db.products.find((p) => p.id === productId && !p.deleted_at);
  if (!product) throw err404('محصول یافت نشد');
  if (input.title) product.title = input.title;
  if (input.status) product.status = input.status;
  if (input.is_featured !== undefined) product.is_featured = input.is_featured;
  if (input.short_description !== undefined) product.short_description = input.short_description;

  (input.variants ?? []).forEach((patch) => {
    const variant = db.product_variants.find((v) => v.id === patch.id && v.product_id === product.id);
    if (!variant) return;
    if (patch.price != null && patch.price !== variant.price) {
      db.product_price_history.push({
        id: nextId(db.product_price_history), product_variant_id: variant.id,
        old_price: variant.price, new_price: patch.price, created_at: now(), updated_at: now(),
      });
      variant.price = patch.price;
    }
    if (patch.sale_price !== undefined) variant.sale_price = patch.sale_price;
    if (patch.stock != null) variant.stock = Math.max(0, patch.stock);
  });
  product.updated_at = now();
  flushTag('products');
  logActivity(admin.id, 'product.update', 'product', product.id, `ویرایش محصول «${product.title}»`);
  return { id: product.id };
}

export function adminDeleteProduct(admin: D.User, productId: number) {
  const product = db.products.find((p) => p.id === productId && !p.deleted_at);
  if (!product) throw err404('محصول یافت نشد');
  product.deleted_at = now();
  product.status = 'inactive';
  flushTag('products');
  logActivity(admin.id, 'product.delete', 'product', product.id, `حذف محصول «${product.title}»`);
}

// ═══════════ دسته‌بندی‌ها ═══════════
export const adminListCategories = () =>
  db.categories.map((c) => ({
    ...c,
    productsCount: db.products.filter((p) => p.category_id === c.id && !p.deleted_at).length,
    childrenCount: db.categories.filter((x) => x.parent_id === c.id).length,
  }));

export function adminCreateCategory(admin: D.User, input: { title: string; parent_id?: number | null; icon?: string | null; sort_order?: number; image?: string | null }) {
  const id = nextId(db.categories);
  const category: D.Category = {
    id, parent_id: input.parent_id ?? null, title: input.title,
    slug: `cat-${id}`, icon: input.icon ?? null, image: input.image ?? null,
    description: null, sort_order: input.sort_order ?? 99, is_active: true,
    meta_title: input.title, meta_description: null, created_at: now(), updated_at: now(),
  };
  db.categories.push(category);
  flushTag('categories');
  logActivity(admin.id, 'category.create', 'category', id, `ایجاد دسته «${input.title}»`);
  return category;
}

export function adminUpdateCategory(admin: D.User, id: number, input: Partial<{ title: string; icon: string | null; sort_order: number; is_active: boolean; image: string | null }>) {
  const category = db.categories.find((c) => c.id === id);
  if (!category) throw err404('دسته‌بندی یافت نشد');
  Object.assign(category, {
    title: input.title ?? category.title,
    icon: input.icon !== undefined ? input.icon : category.icon,
    image: input.image !== undefined ? input.image : category.image,
    sort_order: input.sort_order ?? category.sort_order,
    is_active: input.is_active ?? category.is_active,
    updated_at: now(),
  });
  flushTag('categories');
  logActivity(admin.id, 'category.update', 'category', id, `ویرایش دسته «${category.title}»`);
  return category;
}

export function adminDeleteCategory(admin: D.User, id: number) {
  const category = db.categories.find((c) => c.id === id);
  if (!category) throw err404('دسته‌بندی یافت نشد');
  if (db.categories.some((c) => c.parent_id === id)) {
    throw err422({ category: ['ابتدا زیردسته‌های این دسته را حذف یا منتقل کنید'] });
  }
  if (db.products.some((p) => p.category_id === id && !p.deleted_at)) {
    throw err422({ category: ['این دسته دارای محصول است و قابل حذف نیست'] });
  }
  db.categories = db.categories.filter((c) => c.id !== id);
  flushTag('categories');
  logActivity(admin.id, 'category.delete', 'category', id, `حذف دسته «${category.title}»`);
}

// ═══════════ برندها ═══════════
export const adminListBrands = () =>
  db.brands.map((b) => ({ ...b, productsCount: db.products.filter((p) => p.brand_id === b.id && !p.deleted_at).length }));

export function adminCreateBrand(admin: D.User, input: { title: string; logo?: string | null }) {
  const id = nextId(db.brands);
  const brand: D.Brand = {
    id, title: input.title, slug: `brand-${id}`, logo: input.logo ?? null,
    description: null, is_active: true, meta_title: input.title, meta_description: null,
    created_at: now(), updated_at: now(),
  };
  db.brands.push(brand);
  flushTag('products');
  logActivity(admin.id, 'brand.create', 'brand', id, `ایجاد برند «${input.title}»`);
  return brand;
}

export function adminUpdateBrand(admin: D.User, id: number, input: { title?: string; is_active?: boolean; logo?: string | null }) {
  const brand = db.brands.find((b) => b.id === id);
  if (!brand) throw err404('برند یافت نشد');
  if (input.title) brand.title = input.title;
  if (input.is_active !== undefined) brand.is_active = input.is_active;
  if (input.logo !== undefined) brand.logo = input.logo;
  brand.updated_at = now();
  flushTag('products');
  logActivity(admin.id, 'brand.update', 'brand', id, `ویرایش برند «${brand.title}»`);
  return brand;
}

export function adminDeleteBrand(admin: D.User, id: number) {
  const brand = db.brands.find((b) => b.id === id);
  if (!brand) throw err404('برند یافت نشد');
  if (db.products.some((p) => p.brand_id === id && !p.deleted_at)) {
    throw err422({ brand: ['این برند دارای محصول است؛ ابتدا محصولات را ویرایش کنید'] });
  }
  db.brands = db.brands.filter((b) => b.id !== id);
  logActivity(admin.id, 'brand.delete', 'brand', id, `حذف برند «${brand.title}»`);
}

// ═══════════ کوپن‌ها ═══════════
export const adminListCoupons = () => db.coupons.map(toCouponDto).sort((a, b) => b.id - a.id);

export function adminCreateCoupon(admin: D.User, input: Partial<D.Coupon> & { code: string; type: D.CouponType; value: number }) {
  const exists = db.coupons.some((c) => c.code.toLowerCase() === input.code.toLowerCase());
  if (exists) throw err422({ code: ['این کد قبلاً استفاده شده است'] });
  if (input.type === 'percentage' && (input.value < 1 || input.value > 100)) {
    throw err422({ value: ['درصد تخفیف باید بین ۱ تا ۱۰۰ باشد'] });
  }
  const coupon: D.Coupon = {
    id: nextId(db.coupons), code: input.code.toUpperCase(), type: input.type, value: input.value,
    max_discount: input.max_discount ?? null, min_order_amount: input.min_order_amount ?? null,
    usage_limit: input.usage_limit ?? null, used_count: 0, per_user_limit: input.per_user_limit ?? 1,
    starts_at: input.starts_at ?? null, expires_at: input.expires_at ?? null,
    is_active: input.is_active ?? true,
    applicable_categories: input.applicable_categories ?? null,
    applicable_products: input.applicable_products ?? null,
    created_at: now(), updated_at: now(),
  };
  db.coupons.push(coupon);
  logActivity(admin.id, 'coupon.create', 'coupon', coupon.id, `ایجاد کد تخفیف ${coupon.code}`);
  return toCouponDto(coupon);
}

export function adminUpdateCoupon(admin: D.User, id: number, input: Partial<D.Coupon>) {
  const coupon = db.coupons.find((c) => c.id === id);
  if (!coupon) throw err404('کوپن یافت نشد');
  if (input.code && input.code.toLowerCase() !== coupon.code.toLowerCase()
      && db.coupons.some((c) => c.code.toLowerCase() === input.code!.toLowerCase())) {
    throw err422({ code: ['این کد قبلاً استفاده شده است'] });
  }
  Object.assign(coupon, {
    code: input.code ? input.code.toUpperCase() : coupon.code,
    type: input.type ?? coupon.type,
    value: input.value ?? coupon.value,
    max_discount: input.max_discount !== undefined ? input.max_discount : coupon.max_discount,
    min_order_amount: input.min_order_amount !== undefined ? input.min_order_amount : coupon.min_order_amount,
    usage_limit: input.usage_limit !== undefined ? input.usage_limit : coupon.usage_limit,
    per_user_limit: input.per_user_limit ?? coupon.per_user_limit,
    starts_at: input.starts_at !== undefined ? input.starts_at : coupon.starts_at,
    expires_at: input.expires_at !== undefined ? input.expires_at : coupon.expires_at,
    is_active: input.is_active ?? coupon.is_active,
    updated_at: now(),
  });
  logActivity(admin.id, 'coupon.update', 'coupon', id, `ویرایش کد تخفیف ${coupon.code}`);
  return toCouponDto(coupon);
}

export function adminDeleteCoupon(admin: D.User, id: number) {
  const coupon = db.coupons.find((c) => c.id === id);
  if (!coupon) throw err404('کوپن یافت نشد');
  db.coupons = db.coupons.filter((c) => c.id !== id);
  db.carts.forEach((cart) => { if (cart.coupon_id === id) cart.coupon_id = null; });
  logActivity(admin.id, 'coupon.delete', 'coupon', id, `حذف کد تخفیف ${coupon.code}`);
}

// ═══════════ پیشنهادهای ویژه ═══════════
export function adminListOffers() {
  return db.special_offers
    .map((o) => {
      const variant = db.product_variants.find((v) => v.id === o.product_variant_id);
      const product = variant && db.products.find((p) => p.id === variant.product_id);
      return {
        ...o,
        productTitle: product?.title ?? '—',
        productId: product?.id ?? null,
        variantSku: variant?.sku ?? '—',
      };
    })
    .sort((a, b) => b.id - a.id);
}

export function adminCreateOffer(admin: D.User, input: {
  product_variant_id: number; discount_price: number; stock: number;
  starts_at: string; expires_at: string; type?: D.SpecialOfferType; title?: string;
}) {
  const variant = db.product_variants.find((v) => v.id === input.product_variant_id);
  if (!variant) throw err422({ product_variant_id: ['تنوع محصول یافت نشد'] });
  if (input.discount_price >= variant.price) {
    throw err422({ discount_price: ['قیمت پیشنهادی باید کمتر از قیمت اصلی باشد'] });
  }
  if (new Date(input.expires_at) <= new Date(input.starts_at)) {
    throw err422({ expires_at: ['تاریخ پایان باید بعد از تاریخ شروع باشد'] });
  }
  const percentage = Math.round(((variant.price - input.discount_price) / variant.price) * 100);
  const offer: D.SpecialOffer = {
    id: nextId(db.special_offers),
    title: input.title ?? (input.type === 'daily_deals' ? 'فروش روزانه' : 'پیشنهاد شگفت‌انگیز'),
    type: input.type ?? 'incredible_offers',
    product_variant_id: input.product_variant_id,
    discount_percentage: percentage,
    discount_price: input.discount_price,
    stock: input.stock, sold_count: 0,
    starts_at: input.starts_at, expires_at: input.expires_at,
    is_active: true, created_at: now(), updated_at: now(),
  };
  db.special_offers.push(offer);
  flushTag('home');
  flushTag('products');
  logActivity(admin.id, 'offer.create', 'special_offer', offer.id, `ایجاد پیشنهاد ${percentage}٪`);
  return offer;
}

export function adminUpdateOffer(admin: D.User, id: number, input: Partial<D.SpecialOffer>) {
  const offer = db.special_offers.find((o) => o.id === id);
  if (!offer) throw err404('پیشنهاد یافت نشد');
  Object.assign(offer, {
    discount_price: input.discount_price ?? offer.discount_price,
    stock: input.stock ?? offer.stock,
    starts_at: input.starts_at ?? offer.starts_at,
    expires_at: input.expires_at ?? offer.expires_at,
    is_active: input.is_active ?? offer.is_active,
    updated_at: now(),
  });
  const variant = db.product_variants.find((v) => v.id === offer.product_variant_id);
  if (variant) offer.discount_percentage = Math.max(1, Math.round(((variant.price - offer.discount_price) / variant.price) * 100));
  flushTag('home');
  logActivity(admin.id, 'offer.update', 'special_offer', id, 'ویرایش پیشنهاد ویژه');
  return offer;
}

export function adminDeleteOffer(admin: D.User, id: number) {
  if (!db.special_offers.some((o) => o.id === id)) throw err404('پیشنهاد یافت نشد');
  db.special_offers = db.special_offers.filter((o) => o.id !== id);
  flushTag('home');
  logActivity(admin.id, 'offer.delete', 'special_offer', id, 'حذف پیشنهاد ویژه');
}

// ═══════════ دیدگاه‌ها (مدیریت) ═══════════
export function adminListReviews(filters: { status?: string; page: number; perPage: number }) {
  let list = [...db.reviews];
  if (filters.status) list = list.filter((r) => r.status === filters.status);
  list = list.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  return { items: list.slice((filters.page - 1) * filters.perPage, filters.page * filters.perPage).map(toReviewAdminRow), total: list.length };
}

export function adminModerateReview(admin: D.User, id: number, status: 'approved' | 'rejected') {
  const review = db.reviews.find((r) => r.id === id);
  if (!review) throw err404('دیدگاه یافت نشد');
  review.status = status;
  review.updated_at = now();
  logActivity(admin.id, `review.${status}`, 'review', id, `${status === 'approved' ? 'تایید' : 'رد'} دیدگاه «${review.title}»`);
  return toReviewAdminRow(review);
}

export function adminDeleteReview(admin: D.User, id: number) {
  if (!db.reviews.some((r) => r.id === id)) throw err404('دیدگاه یافت نشد');
  db.reviews = db.reviews.filter((r) => r.id !== id);
  logActivity(admin.id, 'review.delete', 'review', id, 'حذف دیدگاه');
}

// ═══════════ بنرها ═══════════
export const adminListBanners = () => db.banners.map(toUserishBanner).sort((a, b) => a.sort_order - b.sort_order);

export function adminCreateBanner(admin: D.User, input: { title: string; image: string; position: D.BannerPosition; link?: string | null; sort_order?: number }) {
  const banner: D.Banner = {
    id: nextId(db.banners), title: input.title, image: input.image,
    link: input.link ?? null, position: input.position,
    sort_order: input.sort_order ?? 99, starts_at: null, expires_at: null,
    is_active: true, created_at: now(), updated_at: now(),
  };
  db.banners.push(banner);
  flushTag('home');
  logActivity(admin.id, 'banner.create', 'banner', banner.id, `ایجاد بنر «${banner.title}»`);
  return toUserishBanner(banner);
}

export function adminUpdateBanner(admin: D.User, id: number, input: Partial<D.Banner>) {
  const banner = db.banners.find((b) => b.id === id);
  if (!banner) throw err404('بنر یافت نشد');
  Object.assign(banner, {
    title: input.title ?? banner.title,
    image: input.image ?? banner.image,
    link: input.link !== undefined ? input.link : banner.link,
    position: input.position ?? banner.position,
    sort_order: input.sort_order ?? banner.sort_order,
    is_active: input.is_active ?? banner.is_active,
    updated_at: now(),
  });
  flushTag('home');
  logActivity(admin.id, 'banner.update', 'banner', id, `ویرایش بنر «${banner.title}»`);
  return toUserishBanner(banner);
}

export function adminDeleteBanner(admin: D.User, id: number) {
  if (!db.banners.some((b) => b.id === id)) throw err404('بنر یافت نشد');
  db.banners = db.banners.filter((b) => b.id !== id);
  flushTag('home');
  logActivity(admin.id, 'banner.delete', 'banner', id, 'حذف بنر');
}

// ═══════════ فروشندگان (مدیریت) ═══════════
export const adminListSellers = () =>
  db.sellers
    .map((s) => ({ ...toSellerDto(s), productsCount: db.products.filter((p) => p.seller_id === s.id && !p.deleted_at).length }))
    .sort((a, b) => a.id - b.id);

export function adminSetSellerStatus(admin: D.User, id: number, status: D.SellerStatus, reason?: string) {
  const seller = db.sellers.find((s) => s.id === id);
  if (!seller) throw err404('فروشنده یافت نشد');
  seller.status = status;
  seller.updated_at = now();

  const owner = db.users.find((u) => u.id === seller.user_id);
  if (owner && !['admin', 'super_admin'].includes(owner.role)) {
    owner.role = status === 'approved' ? 'seller' : 'customer';
  }
  if (owner) {
    const messages: Record<D.SellerStatus, string> = {
      approved: `فروشگاه «${seller.shop_name}» شما تایید شد؛ اکنون می‌توانید محصول ثبت کنید.`,
      rejected: `درخواست فروشندگی «${seller.shop_name}» رد شد.${reason ? ' دلیل: ' + reason : ''}`,
      suspended: `فروشگاه «${seller.shop_name}» شما به‌صورت موقت معلق شد.${reason ? ' دلیل: ' + reason : ''}`,
      pending: 'درخواست فروشندگی شما در حال بررسی است.',
    };
    notify(owner.id, 'system', 'وضعیت فروشگاه شما', messages[status]);
  }
  logActivity(admin.id, `seller.${status}`, 'seller', id, `${status} فروشگاه «${seller.shop_name}»`);
  return toSellerDto(seller);
}
