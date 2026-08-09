/**
 * ─── DTO های عمومی API (معادل Laravel API Resources) ───
 * ساختارهای خروجی که فرانت‌اند مصرف می‌کند — camelCase و بدون داده داخلی.
 */

export interface ColorDto { id: number; name: string; hex: string }
export interface SizeDto { id: number; name: string; type: string }
export interface GuaranteeDto { id: number; title: string; months: number }
export interface BrandDto { id: number; title: string; slug: string; logo: string | null }
export interface CategoryMiniDto { id: number; title: string; slug: string }
export interface CategoryNodeDto extends CategoryMiniDto {
  icon: string | null;
  image: string | null;
  children: CategoryNodeDto[];
}
export interface SellerDto { id: number; shopName: string; slug: string; rating: number }

export interface VariantDto {
  id: number;
  sku: string;
  price: number;
  salePrice: number | null;
  effectivePrice: number; // کمترین قیمت فعال (با احتساب شگفت‌انگیز)
  discountPercent: number;
  stock: number;
  maxPerOrder: number;
  color: ColorDto | null;
  size: SizeDto | null;
  guarantee: GuaranteeDto | null;
  isIncredible: boolean;
  offerEndsAt: string | null;
}

export interface ProductCardDto {
  id: number;
  slug: string;
  title: string;
  image: string;
  price: number; // بالاترین قیمت قبل از تخفیف (خط‌خورده)
  effectivePrice: number; // کمترین قیمت قابل پرداخت
  discountPercent: number;
  rating: number; // میانگین امتیاز (۰ تا ۵)
  reviewCount: number;
  stock: number;
  colors: ColorDto[];
  brand: BrandDto | null;
  category: CategoryMiniDto | null;
  seller: SellerDto | null;
  isIncredible: boolean;
  isFeatured: boolean;
}

export interface ProductImageDto { id: number; url: string; alt: string; isPrimary: boolean }

export interface ProductAttributeDto { title: string; value: string }

export interface ProductDetailDto extends ProductCardDto {
  shortDescription: string | null;
  body: string | null;
  images: ProductImageDto[];
  variants: VariantDto[];
  attributes: ProductAttributeDto[];
  breadcrumb: CategoryMiniDto[];
  questionsCount: number;
  viewCount: number;
}

export interface ReviewDto {
  id: number;
  title: string;
  body: string;
  rating: number;
  pros: string[];
  cons: string[];
  authorName: string;
  isBuyer: boolean;
  likesCount: number;
  dislikesCount: number;
  createdAt: string;
}

export interface QuestionDto {
  id: number;
  question: string;
  answer: string | null;
  askedBy: string;
  answeredAt: string | null;
  createdAt: string;
}

export interface BannerDto { id: number; title: string; image: string; link: string | null }

export interface IncredibleOfferDto {
  id: number;
  discountPercentage: number;
  expiresAt: string;
  stock: number;
  soldCount: number;
  soldPercent: number; // درصد فروش رفته (برای نوار پیشرفت)
  variantId: number;
  product: ProductCardDto;
}

export type ProductSort =
  | 'most_relevant' | 'best_selling' | 'most_viewed' | 'highest_rated'
  | 'newest' | 'price_asc' | 'price_desc' | 'highest_discount';

export interface CategoryFiltersDto {
  brands: Array<BrandDto & { count: number }>;
  colors: Array<ColorDto & { count: number }>;
  attributes: Array<{
    id: number;
    title: string;
    values: Array<{ id: number; value: string; count: number }>;
  }>;
  priceRange: { min: number; max: number };
}

export interface HomeDto {
  heroBanners: BannerDto[];
  sidebarBanners: BannerDto[];
  incredibleOffers: IncredibleOfferDto[];
  incredibleEndsAt: string | null;
  categories: CategoryNodeDto[];
  featuredProducts: ProductCardDto[];
  bestSellingProducts: ProductCardDto[];
  newestProducts: ProductCardDto[];
  brands: BrandDto[];
}
