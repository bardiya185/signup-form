import { db } from '../db';
import { emit, EVT } from '../events';
import { boundaryCategoryIds } from './catalog.repository';
import {
  activeOfferFor, effectivePriceOf, reviewStatsOf, soldScoreOf,
  toCategoryTreeDto, toProductCardDto, toProductDetailDto,
} from '../serializers';
import type * as D from '@/types/domain';
import type {
  CategoryFiltersDto, ProductCardDto, ProductSort,
} from '@/types/dto';

export interface ProductQueryParams {
  categorySlug?: string;
  brandSlugs?: string[];
  colorIds?: number[];
  attributeValueIds?: number[];
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  hasDiscount?: boolean;
  sort?: ProductSort;
  page: number;
  perPage: number;
}

interface ProductAggregates {
  minEffective: number;
  maxPrice: number;
  totalStock: number;
  hasDiscount: boolean;
}

const aggregatesOf = (product: D.Product): ProductAggregates => {
  const variants = db.product_variants.filter((v) => v.product_id === product.id && v.is_active);
  const eff = variants.map((v) => effectivePriceOf(v));
  const maxPrice = variants.length ? Math.max(...variants.map((v) => v.price)) : 0;
  const minEffective = eff.length ? Math.min(...eff) : 0;
  return {
    minEffective,
    maxPrice,
    totalStock: variants.reduce((a, v) => a + v.stock, 0),
    hasDiscount: minEffective < maxPrice || variants.some((v) => !!activeOfferFor(v.id)),
  };
};

const matchesQuery = (product: D.Product, q: string): boolean => {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  const brand = db.brands.find((b) => b.id === product.brand_id);
  const haystack = [
    product.title, product.short_description ?? '',
    brand?.title ?? '', brand?.slug ?? '',
  ].join(' ').toLowerCase();
  return haystack.includes(needle);
};

/** لیست محصولات با فیلتر، مرتب‌سازی و صفحه‌بندی — معادل ProductController@index */
export function queryProducts(params: ProductQueryParams): { items: ProductCardDto[]; total: number } {
  let pool = db.products.filter((p) => p.status === 'active');

  if (params.categorySlug) {
    const ids = boundaryCategoryIds(params.categorySlug);
    pool = pool.filter((p) => ids.includes(p.category_id));
  }
  if (params.brandSlugs?.length) {
    const brandIds = db.brands.filter((b) => params.brandSlugs!.includes(b.slug)).map((b) => b.id);
    pool = pool.filter((p) => p.brand_id != null && brandIds.includes(p.brand_id));
  }
  if (params.colorIds?.length) {
    pool = pool.filter((p) =>
      db.product_variants.some((v) =>
        v.product_id === p.id && v.is_active && v.color_id != null && params.colorIds!.includes(v.color_id)),
    );
  }
  if (params.attributeValueIds?.length) {
    pool = pool.filter((p) =>
      db.product_attributes.some((pa) =>
        pa.product_id === p.id && pa.attribute_value_id != null && params.attributeValueIds!.includes(pa.attribute_value_id)),
    );
  }
  if (params.q) pool = pool.filter((p) => matchesQuery(p, params.q!));
  if (params.minPrice != null) pool = pool.filter((p) => aggregatesOf(p).minEffective >= params.minPrice!);
  if (params.maxPrice != null) pool = pool.filter((p) => aggregatesOf(p).minEffective <= params.maxPrice!);
  if (params.inStock) pool = pool.filter((p) => aggregatesOf(p).totalStock > 0);
  if (params.hasDiscount) pool = pool.filter((p) => aggregatesOf(p).hasDiscount);

  const sort = params.sort ?? 'most_relevant';
  const by: Record<ProductSort, (a: D.Product, b: D.Product) => number> = {
    most_relevant: (a, b) => (Number(b.is_featured) - Number(a.is_featured)) || (b.view_count - a.view_count),
    best_selling: (a, b) => soldScoreOf(b.id) - soldScoreOf(a.id),
    most_viewed: (a, b) => b.view_count - a.view_count,
    highest_rated: (a, b) => reviewStatsOf(b.id).rating - reviewStatsOf(a.id).rating,
    newest: (a, b) => +new Date(b.created_at) - +new Date(a.created_at),
    price_asc: (a, b) => aggregatesOf(a).minEffective - aggregatesOf(b).minEffective,
    price_desc: (a, b) => aggregatesOf(b).minEffective - aggregatesOf(a).minEffective,
    highest_discount: (a, b) =>
      (aggregatesOf(b).maxPrice - aggregatesOf(b).minEffective) / Math.max(1, aggregatesOf(b).maxPrice)
      - (aggregatesOf(a).maxPrice - aggregatesOf(a).minEffective) / Math.max(1, aggregatesOf(a).maxPrice),
  };
  pool = [...pool].sort(by[sort]);

  const total = pool.length;
  const start = (params.page - 1) * params.perPage;
  const items = pool.slice(start, start + params.perPage).map(toProductCardDto);
  return { items, total };
}

/** محصول تکی با slug — معادل ProductController@show */
export function findProductBySlug(slug: string): D.Product | undefined {
  return db.products.find((p) => p.slug === slug && p.status === 'active');
}

export function findProductByParam(param: string): D.Product | undefined {
  const bySlug = findProductBySlug(param);
  if (bySlug) return bySlug;
  const id = Number(param);
  if (Number.isFinite(id)) {
    return db.products.find((p) => p.id === id && p.status === 'active');
  }
  return undefined;
}

export function productDetailBySlug(slug: string) {
  const product = findProductByParam(slug);
  if (!product) return null;
  product.view_count += 1;
  emit(EVT.ProductViewed, { productId: product.id });
  return toProductDetailDto(product);
}

export function relatedProducts(product: D.Product, limit = 6): ProductCardDto[] {
  return db.products
    .filter((p) => p.status === 'active' && p.id !== product.id && p.category_id === product.category_id)
    .slice(0, limit)
    .map(toProductCardDto);
}

/** فیلترهای در دسترس برای یک دسته — برای سایدبار دسته‌بندی */
export function buildCategoryFilters(categorySlug?: string, q?: string): CategoryFiltersDto {
  let pool = db.products.filter((p) => p.status === 'active');
  if (categorySlug) {
    const ids = boundaryCategoryIds(categorySlug);
    pool = pool.filter((p) => ids.includes(p.category_id));
  }
  if (q) pool = pool.filter((p) => matchesQuery(p, q));

  // برندها
  const brandCounts = new Map<number, number>();
  pool.forEach((p) => {
    if (p.brand_id != null) brandCounts.set(p.brand_id, (brandCounts.get(p.brand_id) ?? 0) + 1);
  });
  const brands = [...brandCounts.entries()]
    .map(([id, count]) => {
      const b = db.brands.find((x) => x.id === id);
      return b ? { id: b.id, title: b.title, slug: b.slug, logo: b.logo, count } : null;
    })
    .filter((x): x is NonNullable<typeof x> => !!x)
    .sort((a, b) => b.count - a.count);

  // رنگ‌ها
  const colorCounts = new Map<number, number>();
  pool.forEach((p) => {
    const ids = new Set(
      db.product_variants
        .filter((v) => v.product_id === p.id && v.is_active && v.color_id != null)
        .map((v) => v.color_id as number),
    );
    ids.forEach((id) => colorCounts.set(id, (colorCounts.get(id) ?? 0) + 1));
  });
  const colors = [...colorCounts.entries()]
    .map(([id, count]) => {
      const c = db.colors.find((x) => x.id === id);
      return c ? { id: c.id, name: c.name, hex: c.hex_code, count } : null;
    })
    .filter((x): x is NonNullable<typeof x> => !!x);

  // ویژگی‌های قابل فیلتر
  const attrMap = new Map<number, Map<number, number>>();
  pool.forEach((p) => {
    db.product_attributes
      .filter((pa) => pa.product_id === p.id && pa.attribute_value_id != null)
      .forEach((pa) => {
        const attr = db.attributes.find((a) => a.id === pa.attribute_id);
        if (!attr?.filterable) return;
        if (!attrMap.has(attr.id)) attrMap.set(attr.id, new Map());
        const values = attrMap.get(attr.id)!;
        const vid = pa.attribute_value_id!;
        values.set(vid, (values.get(vid) ?? 0) + 1);
      });
  });
  const attributes = [...attrMap.entries()]
    .map(([attrId, values]) => {
      const attr = db.attributes.find((a) => a.id === attrId)!;
      return {
        id: attr.id,
        title: attr.title,
        values: [...values.entries()]
          .map(([vid, count]) => {
            const av = db.attribute_values.find((x) => x.id === vid);
            return av ? { id: av.id, value: av.value, count } : null;
          })
          .filter((x): x is NonNullable<typeof x> => !!x),
      };
    })
    .filter((a) => a.values.length > 0);

  // بازه قیمت
  const effs = pool.map((p) => aggregatesOf(p).minEffective);
  const priceRange = {
    min: effs.length ? Math.min(...effs) : 0,
    max: effs.length ? Math.max(...effs) : 0,
  };

  return { brands, colors, attributes, priceRange };
}

export { toCategoryTreeDto };
