import { db } from '../db';
import { listBrands } from './catalog.repository';
import { categoryTree } from './catalog.repository';
import { soldScoreOf, toBannerDto, toOfferDto, toProductCardDto } from '../serializers';
import type * as D from '@/types/domain';
import type { BannerDto, HomeDto, IncredibleOfferDto } from '@/types/dto';

export function bannersByPosition(position: D.BannerPosition): BannerDto[] {
  const now = new Date();
  return db.banners
    .filter((b) =>
      b.is_active && b.position === position &&
      (!b.starts_at || new Date(b.starts_at) <= now) &&
      (!b.expires_at || new Date(b.expires_at) >= now))
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(toBannerDto);
}

export function activeOffers(type: D.SpecialOfferType = 'incredible_offers'): IncredibleOfferDto[] {
  const now = new Date();
  return db.special_offers
    .filter((o) =>
      o.is_active && o.type === type &&
      new Date(o.starts_at) <= now && now <= new Date(o.expires_at))
    .map(toOfferDto)
    .filter((x): x is IncredibleOfferDto => !!x)
    .sort((a, b) => b.discountPercentage - a.discountPercentage);
}

/** داده تجمیعی صفحه اصلی — یک ریکوئست به جای چندین ریکوئست */
export function homePayload(): HomeDto {
  const offers = activeOffers('incredible_offers');
  const active = db.products.filter((p) => p.status === 'active');

  const featured = active
    .filter((p) => p.is_featured)
    .slice(0, 8)
    .map(toProductCardDto);

  const bestSelling = [...active]
    .sort((a, b) => soldScoreOf(b.id) - soldScoreOf(a.id))
    .slice(0, 8)
    .map(toProductCardDto);

  const newest = [...active]
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
    .slice(0, 8)
    .map(toProductCardDto);

  return {
    heroBanners: bannersByPosition('hero'),
    sidebarBanners: bannersByPosition('sidebar'),
    incredibleOffers: offers,
    incredibleEndsAt: offers.length ? offers[0].expiresAt : null,
    categories: categoryTree(),
    featuredProducts: featured,
    bestSellingProducts: bestSelling,
    newestProducts: newest,
    brands: listBrands(),
  };
}

export function menusByLocation(location: string) {
  return db.menus.filter((m) => m.location === location && m.is_active);
}

export function activeFaqs() {
  return db.faqs.filter((f) => f.is_active).sort((a, b) => a.sort_order - b.sort_order);
}

export function pageBySlug(slug: string) {
  return db.pages.find((p) => p.slug === slug && p.status === 'published');
}

export function findCouponByCode(code: string): D.Coupon | undefined {
  return db.coupons.find((c) => c.code.toLowerCase() === code.trim().toLowerCase() && c.is_active);
}

export function activeShippingMethods() {
  return db.shipping_methods.filter((m) => m.is_active);
}

// ─── بلاگ و جغرافیا ───
export function blogList(page: number, perPage: number) {
  const list = db.blog_posts
    .filter((p) => p.status === 'published' && !p.deleted_at)
    .sort((a, b) => +new Date(b.published_at ?? 0) - +new Date(a.published_at ?? 0));
  return { items: list.slice((page - 1) * perPage, page * perPage), total: list.length };
}

export function blogPostBySlug(slug: string) {
  const post = db.blog_posts.find((p) => p.slug === slug && p.status === 'published' && !p.deleted_at);
  if (post) post.view_count += 1;
  return post ?? null;
}

export function relatedBlogPosts(post: D.BlogPost, limit = 3) {
  return db.blog_posts
    .filter((p) => p.status === 'published' && p.id !== post.id && !p.deleted_at)
    .slice(0, limit);
}

export const listProvinces = () => db.provinces;

export function citiesOfProvince(provinceId: number) {
  return db.cities.filter((c) => c.province_id === provinceId);
}

export function slidersByPosition(position: string) {
  return db.sliders.filter((s) => s.position === position && s.is_active);
}

export const sliderPositions = () => ['home_hero'];
