/**
 * ─── Serializers (معادل Laravel API Resources) ───
 */
import { db } from './db';
import type * as D from '@/types/domain';
import type {
  BannerDto, BrandDto, CategoryMiniDto, CategoryNodeDto, ColorDto,
  GuaranteeDto, IncredibleOfferDto, ProductAttributeDto, ProductCardDto,
  ProductDetailDto, ProductImageDto, QuestionDto, ReviewDto, SellerDto,
  SizeDto, VariantDto,
} from '@/types/dto';

const NOW = () => new Date();

// ─── Lookup ───
export const colorOf = (id: number | null): ColorDto | null => {
  if (id == null) return null;
  const c = db.colors.find((x) => x.id === id);
  return c ? { id: c.id, name: c.name, hex: c.hex_code } : null;
};

export const sizeOf = (id: number | null): SizeDto | null => {
  if (id == null) return null;
  const s = db.sizes.find((x) => x.id === id);
  return s ? { id: s.id, name: s.name, type: s.type } : null;
};

export const guaranteeOf = (id: number | null): GuaranteeDto | null => {
  if (id == null) return null;
  const g = db.guarantees.find((x) => x.id === id);
  return g ? { id: g.id, title: g.title, months: g.months } : null;
};

export const brandOf = (id: number | null): BrandDto | null => {
  if (id == null) return null;
  const b = db.brands.find((x) => x.id === id);
  return b ? { id: b.id, title: b.title, slug: b.slug, logo: b.logo } : null;
};

export const sellerOf = (id: number | null): SellerDto | null => {
  if (id == null) return null;
  const s = db.sellers.find((x) => x.id === id);
  return s ? { id: s.id, shopName: s.shop_name, slug: s.slug, rating: s.rating } : null;
};

const categoryMini = (c: D.Category): CategoryMiniDto => ({ id: c.id, title: c.title, slug: c.slug });

export const categoryMiniOf = (id: number | null): CategoryMiniDto | null => {
  const c = db.categories.find((x) => x.id === id);
  return c ? categoryMini(c) : null;
};

// ─── پیشنهاد فعال برای واریانت ───
export const activeOfferFor = (variantId: number): D.SpecialOffer | null =>
  db.special_offers.find((o) =>
    o.is_active && o.product_variant_id === variantId &&
    new Date(o.starts_at) <= NOW() && NOW() <= new Date(o.expires_at),
  ) ?? null;

export const effectivePriceOf = (variant: D.ProductVariant): number => {
  const offer = activeOfferFor(variant.id);
  if (offer) return offer.discount_price;
  return variant.sale_price ?? variant.price;
};

const discountPercentOf = (price: number, effective: number): number =>
  price > effective ? Math.round(((price - effective) / price) * 100) : 0;

// ─── واریانت ───
export const toVariantDto = (variant: D.ProductVariant): VariantDto => {
  const offer = activeOfferFor(variant.id);
  const effective = effectivePriceOf(variant);
  return {
    id: variant.id,
    sku: variant.sku,
    price: variant.price,
    salePrice: variant.sale_price,
    effectivePrice: effective,
    discountPercent: discountPercentOf(variant.price, effective),
    stock: variant.stock,
    maxPerOrder: variant.max_per_order,
    color: colorOf(variant.color_id),
    size: sizeOf(variant.size_id),
    guarantee: guaranteeOf(variant.guarantee_id),
    isIncredible: !!offer,
    offerEndsAt: offer ? offer.expires_at : null,
  };
};

// ─── آمار دیدگاه‌ها ───
export const reviewStatsOf = (productId: number): { rating: number; count: number } => {
  const list = db.reviews.filter((r) => r.product_id === productId && r.status === 'approved');
  if (!list.length) return { rating: 0, count: 0 };
  const sum = list.reduce((acc, r) => acc + r.rating, 0);
  return { rating: Math.round((sum / list.length) * 10) / 10, count: list.length };
};

export const soldScoreOf = (productId: number): number => {
  const variantIds = db.product_variants.filter((v) => v.product_id === productId).map((v) => v.id);
  const sold = db.special_offers
    .filter((o) => variantIds.includes(o.product_variant_id))
    .reduce((acc, o) => acc + o.sold_count, 0);
  return sold + reviewStatsOf(productId).count * 5;
};

// ─── واریانت‌های فعال محصول ───
const activeVariantsOf = (productId: number): D.ProductVariant[] =>
  db.product_variants.filter((v) => v.product_id === productId && v.is_active);

// ─── کارت محصول (مثل ProductResource::collection در لاراول) ───
export const toProductCardDto = (product: D.Product): ProductCardDto => {
  const variants = activeVariantsOf(product.id);
  const primaryImage =
    db.product_images.find((i) => i.product_id === product.id && i.is_primary) ??
    db.product_images.find((i) => i.product_id === product.id);

  const prices = variants.map((v) => v.price);
  const effective = variants.map((v) => effectivePriceOf(v));
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const minEffective = effective.length ? Math.min(...effective) : 0;

  const colorIds = [...new Set(variants.map((v) => v.color_id).filter((x): x is number => x != null))];
  const stats = reviewStatsOf(product.id);

  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    image: primaryImage?.image_path ?? '/products/real/unique/book.jpg',
    price: maxPrice,
    effectivePrice: minEffective,
    discountPercent: discountPercentOf(maxPrice, minEffective),
    rating: stats.rating,
    reviewCount: stats.count,
    stock: variants.reduce((acc, v) => acc + v.stock, 0),
    colors: colorIds.map((id) => colorOf(id)).filter((x): x is ColorDto => !!x),
    brand: brandOf(product.brand_id),
    category: categoryMiniOf(product.category_id),
    seller: sellerOf(product.seller_id),
    isIncredible: variants.some((v) => !!activeOfferFor(v.id)),
    isFeatured: product.is_featured,
  };
};

// ─── جزییات محصول ───
export const toProductDetailDto = (product: D.Product): ProductDetailDto => {
  const breadcrumb: CategoryMiniDto[] = [];
  let cursor = db.categories.find((c) => c.id === product.category_id);
  while (cursor) {
    breadcrumb.unshift(categoryMini(cursor));
    cursor = db.categories.find((c) => c.id === cursor!.parent_id);
  }

  const images: ProductImageDto[] = db.product_images
    .filter((i) => i.product_id === product.id)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((i) => ({ id: i.id, url: i.image_path, alt: i.alt_text ?? product.title, isPrimary: i.is_primary }));

  const attributes: ProductAttributeDto[] = db.product_attributes
    .filter((pa) => pa.product_id === product.id)
    .map((pa) => {
      const attr = db.attributes.find((a) => a.id === pa.attribute_id);
      if (!attr) return null;
      let value = pa.custom_value ?? '';
      if (pa.attribute_value_id != null) {
        value = db.attribute_values.find((av) => av.id === pa.attribute_value_id)?.value ?? value;
      }
      return { title: attr.title, value };
    })
    .filter((x): x is ProductAttributeDto => !!x);

  return {
    ...toProductCardDto(product),
    shortDescription: product.short_description,
    body: product.body,
    images,
    variants: activeVariantsOf(product.id).map(toVariantDto),
    attributes,
    breadcrumb,
    questionsCount: db.product_questions.filter(
      (q) => q.product_id === product.id && q.status !== 'rejected',
    ).length,
    viewCount: product.view_count,
  };
};

// ─── درخت دسته‌بندی ───
export const toCategoryTreeDto = (parentId: number | null = null): CategoryNodeDto[] =>
  db.categories
    .filter((c) => c.parent_id === parentId && c.is_active)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((c) => ({
      ...categoryMini(c),
      icon: c.icon,
      image: c.image,
      children: toCategoryTreeDto(c.id),
    }));

// ─── بنر ───
export const toBannerDto = (b: D.Banner): BannerDto => ({ id: b.id, title: b.title, image: b.image, link: b.link });

// ─── پیشنهاد شگفت‌انگیز ───
export const toOfferDto = (offer: D.SpecialOffer): IncredibleOfferDto | null => {
  const variant = db.product_variants.find((v) => v.id === offer.product_variant_id);
  if (!variant) return null;
  const product = db.products.find((p) => p.id === variant.product_id && p.status === 'active');
  if (!product) return null;

  const card = toProductCardDto(product);
  // قیمت‌های کارت را با قیمت شگفت‌انگیز جایگزین می‌کنیم
  card.price = variant.price;
  card.effectivePrice = offer.discount_price;
  card.discountPercent = offer.discount_percentage;
  card.isIncredible = true;

  return {
    id: offer.id,
    discountPercentage: offer.discount_percentage,
    expiresAt: offer.expires_at,
    stock: offer.stock,
    soldCount: offer.sold_count,
    soldPercent: Math.min(100, Math.round((offer.sold_count / (offer.stock + offer.sold_count)) * 100)),
    variantId: variant.id,
    product: card,
  };
};

// ─── دیدگاه ───
const userNameOf = (userId: number): string => {
  const u = db.users.find((x) => x.id === userId);
  return u ? `${u.first_name} ${u.last_name}`.trim() || 'کاربر گینان‌کالا' : 'کاربر گینان‌کالا';
};

export const toReviewDto = (r: D.Review): ReviewDto => ({
  id: r.id,
  title: r.title,
  body: r.body,
  rating: r.rating,
  pros: r.pros,
  cons: r.cons,
  authorName: userNameOf(r.user_id),
  isBuyer: r.is_buyer,
  likesCount: r.likes_count,
  dislikesCount: r.dislikes_count,
  createdAt: r.created_at,
});

// ─── پرسش ───
export const toQuestionDto = (q: D.ProductQuestion): QuestionDto => ({
  id: q.id,
  question: q.question,
  answer: q.answer,
  askedBy: userNameOf(q.user_id),
  answeredAt: q.answered_at,
  createdAt: q.created_at,
});
