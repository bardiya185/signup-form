'use client';
/**
 * ─── هوک‌های داده (React Query) — لایه اتصال فرانت به API v1 ───
 */
import {
  useInfiniteQuery, useMutation, useQuery, useQueryClient,
} from '@tanstack/react-query';
import { http, firstError, type Envelope, type PaginatedEnv } from '@/lib/http';
import { toast } from '@/stores/ui.store';
import { useAuthStore } from '@/stores/auth.store';
import type {
  BannerDto, CategoryNodeDto, HomeDto, ProductCardDto, ProductDetailDto,
  QuestionDto, ReviewDto, CategoryFiltersDto, IncredibleOfferDto, BrandDto,
} from '@/types/dto';
import type { CartDto } from '@/server/resources';

// ════════ کاتالوگ ════════
export const useHome = () =>
  useQuery({ queryKey: ['home'], queryFn: () => http.get<Envelope<HomeDto>>('/home') });

export const useCategories = () =>
  useQuery({
    queryKey: ['categories'],
    queryFn: () => http.get<Envelope<CategoryNodeDto[]>>('/categories'),
    staleTime: 300_000,
  });

export const useCategoryPage = (slug: string) =>
  useQuery({
    queryKey: ['category', slug],
    queryFn: () =>
      http.get<Envelope<{ category: CategoryNodeDto; breadcrumb: { id: number; title: string; slug: string }[]; filters: CategoryFiltersDto }>>(
        `/categories/${slug}`,
      ),
    enabled: !!slug,
  });

export interface ProductListParams {
  category?: string;
  q?: string;
  brands?: string[];
  colors?: number[];
  attrs?: number[];
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  has_discount?: boolean;
  sort?: string;
  per_page?: number;
}

export function useProductsInfinite(params: ProductListParams) {
  const queryKey = ['products', params];
  return useInfiniteQuery({
    queryKey,
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      http.get<PaginatedEnv<ProductCardDto>>('/products', {
        ...params,
        brands: params.brands?.join(','),
        colors: params.colors?.join(','),
        attrs: params.attrs?.join(','),
        in_stock: params.in_stock ? 1 : undefined,
        has_discount: params.has_discount ? 1 : undefined,
        page: pageParam,
        per_page: params.per_page ?? 12,
      } as Record<string, string | number>),
    getNextPageParam: (lastPage) =>
      lastPage.meta.current_page < lastPage.meta.last_page ? lastPage.meta.current_page + 1 : undefined,
  });
}

export const useCategoryFilters = (slug?: string, q?: string) =>
  useQuery({
    queryKey: ['filters', slug, q],
    queryFn: () => http.get<Envelope<CategoryFiltersDto> & { filters?: never }>(slug ? `/categories/${slug}/filters` : '/products', slug ? {} : { q, with_filters: 1 }),
    enabled: !!(slug || q),
  });

export interface ProductDetailPayload {
  product: ProductDetailDto;
  related: ProductCardDto[];
  questions: QuestionDto[];
}

export const useProductDetail = (slug: string) =>
  useQuery({
    queryKey: ['product', slug],
    queryFn: () => http.get<Envelope<ProductDetailPayload>>(`/products/${slug}`),
    enabled: !!slug,
  });

export const useProductReviews = (slug: string, page = 1) =>
  useQuery({
    queryKey: ['reviews', slug, page],
    queryFn: () => http.get<PaginatedEnv<ReviewDto>>(`/products/${slug}/reviews`, { page, per_page: 6 }),
    enabled: !!slug,
  });

export const useIncredibleOffers = () =>
  useQuery({
    queryKey: ['offers', 'incredible'],
    queryFn: () => http.get<Envelope<{ offers: IncredibleOfferDto[]; endsAt: string | null }>>('/offers/incredible'),
    refetchInterval: 60_000,
  });

export const useSearchSuggest = (q: string) =>
  useQuery({
    queryKey: ['suggest', q],
    queryFn: () =>
      http.get<Envelope<{ query: string; products: ProductCardDto[]; categories: { id: number; title: string; slug: string }[]; brands: BrandDto[] }>>(
        '/search/suggestions', { q },
      ),
    enabled: q.trim().length >= 2,
    staleTime: 60_000,
  });

export const usePopularSearches = () =>
  useQuery({ queryKey: ['search', 'popular'], queryFn: () => http.get<Envelope<{ query: string; hits: number }[]>>('/search/popular'), staleTime: 300_000 });

// ════════ سبد خرید ════════
export const useCart = () => {
  const setCounters = useAuthStore((s) => s.setCounters);
  return useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const res = await http.get<Envelope<CartDto>>('/cart');
      setCounters({ cart: res.data.totals.itemsCount });
      return res;
    },
  });
};

const useCartMutation = <TInput,>(
  fn: (input: TInput) => Promise<Envelope<CartDto>>,
  successMsg?: string,
) => {
  const qc = useQueryClient();
  const setCounters = useAuthStore((s) => s.setCounters);
  return useMutation({
    mutationFn: fn,
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ['cart'] });
      return { previous: qc.getQueryData<Envelope<CartDto>>(['cart']) };
    },
    onSuccess: (res) => {
      qc.setQueryData(['cart'], res);
      setCounters({ cart: res.data.totals.itemsCount });
      if (successMsg) toast.success(successMsg);
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(['cart'], ctx.previous);
      toast.error(firstError(err));
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });
};

export const useAddToCart = () =>
  useCartMutation((input: { product_variant_id: number; quantity: number }) =>
    http.post('/cart/items', input),
  );

export const useUpdateCartItem = () =>
  useCartMutation((input: { id: number; quantity: number }) => http.put(`/cart/items/${input.id}`, { quantity: input.quantity }));

export const useRemoveCartItem = () =>
  useCartMutation((id: number) => http.del(`/cart/items/${id}`));

export const useClearCart = () => useCartMutation(() => http.del('/cart/clear'));

export const useApplyCoupon = () =>
  useCartMutation((code: string) => http.post('/cart/coupon/apply', { code }), 'کد تخفیف اعمال شد');

export const useRemoveCoupon = () => useCartMutation(() => http.del('/cart/coupon/remove'), 'کد تخفیف حذف شد');

// ════════ علاقه‌مندی و مقایسه ════════
export const useWishlist = () => {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: () => http.get<Envelope<ProductCardDto[]>>('/wishlist'),
    enabled: !!user,
  });
};

export const useToggleWishlist = () => {
  const qc = useQueryClient();
  const setCounters = useAuthStore((s) => s.setCounters);
  const user = useAuthStore((s) => s.user);
  return useMutation({
    mutationFn: async (input: { productId: number; remove?: boolean }) => {
      if (!user) throw Object.assign(new Error('برای افزودن به علاقه‌مندی‌ها ابتدا وارد شوید'), { status: 401 });
      const res = await (input.remove
        ? http.del<Envelope<{ added: boolean; count: number }>>(`/wishlist/${input.productId}`)
        : http.post<Envelope<{ added: boolean; count: number }>>(`/wishlist/${input.productId}`));
      return res.data;
    },
    onSuccess: (data) => {
      setCounters({ wishlist: data.count });
      qc.invalidateQueries({ queryKey: ['wishlist'] });
      toast.info(data.added ? 'به علاقه‌مندی‌ها اضافه شد' : 'از علاقه‌مندی‌ها حذف شد');
    },
    onError: (err) => toast.error(firstError(err)),
  });
};

export const useCompare = () =>
  useQuery({
    queryKey: ['compare'],
    queryFn: () =>
      http.get<Envelope<{ category: { id: number; title: string; slug: string } | null; products: ProductDetailDto[] }>>('/compare'),
  });

const useCompareMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { productId: number; remove?: boolean }) =>
      input.remove ? http.del(`/compare/${input.productId}`) : http.post(`/compare/${input.productId}`),
    onSuccess: (_r, v) => {
      qc.invalidateQueries({ queryKey: ['compare'] });
      toast.info(v.remove ? 'از لیست مقایسه حذف شد' : 'به لیست مقایسه اضافه شد');
    },
    onError: (err) => toast.error(firstError(err)),
  });
};
export const useToggleCompare = useCompareMutation;

// ════════ احراز هویت ════════
interface AuthResult {
  user: import('@/stores/auth.store').AuthUser;
  token: string;
  tokenType: 'Bearer';
  firstLogin?: boolean;
}

const useAuthMutation = <TInput,>(fn: (input: TInput) => Promise<Envelope<AuthResult>>) => {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: fn,
    onSuccess: (res) => {
      setSession(res.data.user, res.data.token);
      toast.success(res.data.firstLogin ? 'ثبت‌نام شما با موفقیت انجام شد' : `خوش آمدید، ${res.data.user.firstName}`);
    },
    onError: (err) => toast.error(firstError(err)),
  });
};

export const useLogin = () =>
  useAuthMutation((input: { identity: string; password: string }) => http.post('/auth/login', input));

export const useRegister = () =>
  useAuthMutation((input: { first_name: string; last_name: string; phone: string; email?: string; password: string; password_confirmation: string }) =>
    http.post('/auth/register', input),
  );

export const useVerifyOtp = () =>
  useAuthMutation((input: { phone: string; code: string }) => http.post('/auth/login/otp/verify', input));

export const useSendOtp = () =>
  useMutation({
    mutationFn: (phone: string) => http.post<Envelope<{ devCode: string; expiresIn: number }>>('/auth/login/otp/send', { phone }),
    onError: (err) => toast.error(firstError(err)),
  });
