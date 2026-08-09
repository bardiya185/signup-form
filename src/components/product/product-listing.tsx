'use client';
import { useCategoryFilters, useProductsInfinite } from '@/hooks/api';
import { faDigits, formatPrice } from '@/lib/format';
import { cn } from '@/utils/cn';
import type { CategoryFiltersDto } from '@/types/dto';
import { Breadcrumb, type Crumb } from '@/components/layout/breadcrumb';
import { ProductCard } from '@/components/product/product-card';
import { ErrorState, EmptyState, Spinner } from '@/components/ui/states';
import { ListSkeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, ListFilter, X } from 'lucide-react';
import { FilterSidebar, emptyFilters, type FilterState } from './filter-sidebar';

export const SORTS = [
  { value: 'most_relevant', label: 'مرتبط‌ترین' },
  { value: 'best_selling', label: 'پرفروش‌ترین' },
  { value: 'most_viewed', label: 'پربازدیدترین' },
  { value: 'highest_rated', label: 'بهترین امتیاز' },
  { value: 'newest', label: 'جدیدترین' },
  { value: 'price_asc', label: 'ارزان‌ترین' },
  { value: 'price_desc', label: 'گران‌ترین' },
  { value: 'highest_discount', label: 'بیشترین تخفیف' },
] as const;

function SortBar({ sort, onChange, total }: { sort: string; onChange: (v: string) => void; total?: number }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const current = SORTS.find((s) => s.value === sort);
  return (
    <div className="mb-4 flex items-center gap-3 rounded-2xl border border-zinc-100 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
      <span className="hidden items-center gap-1.5 text-xs font-bold text-zinc-500 sm:flex">
        <ListFilter size={15} /> مرتب‌سازی:
      </span>
      <div className="scrollbar-none hidden gap-1 overflow-x-auto sm:flex">
        {SORTS.map((s) => (
          <button
            key={s.value}
            onClick={() => onChange(s.value)}
            className={cn(
              'shrink-0 rounded-lg px-2.5 py-1.5 text-xs transition',
              sort === s.value
                ? 'font-black text-brand'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white',
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="relative sm:hidden">
        <button onClick={() => setMobileOpen((v) => !v)} className="flex items-center gap-1 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-bold text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
          {current?.label} <ChevronDown size={13} />
        </button>
        {mobileOpen && (
          <div className="absolute right-0 top-full z-30 mt-1 w-44 overflow-hidden rounded-xl border border-zinc-100 bg-white py-1 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            {SORTS.map((s) => (
              <button
                key={s.value}
                onClick={() => { onChange(s.value); setMobileOpen(false); }}
                className="flex w-full items-center justify-between px-3 py-2 text-xs text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                {s.label} {sort === s.value && <Check size={13} className="text-brand" />}
              </button>
            ))}
          </div>
        )}
      </div>
      <span className="mr-auto text-[11px] text-zinc-400">
        {total != null && <>{faDigits(total)} کالا</>}
      </span>
    </div>
  );
}

export function ProductListing({
  category,
  fixedBrands,
  searchMode = false,
  title,
  breadcrumb,
  initialFilters,
}: {
  category?: string;
  fixedBrands?: string[];
  searchMode?: boolean;
  title?: string;
  breadcrumb?: Crumb[];
  initialFilters?: CategoryFiltersDto;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchMode ? (searchParams.get('q') ?? '') : undefined;

  const get = (key: string) => searchParams.get(key);
  const [filters, setFilters] = useState<FilterState>(() => ({
    ...emptyFilters,
    brands: get('brands') ? get('brands')!.split(',') : [],
    inStock: get('in_stock') === '1',
    hasDiscount: get('has_discount') === '1',
  }));
  const [sort, setSort] = useState<string>(searchParams.get('sort') ?? 'most_relevant');
  const [mobileFilters, setMobileFilters] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // سینک فیلترها با URL (قابل اشتراک‌گذاری)
  useEffect(() => {
    const usp = new URLSearchParams();
    if (q) usp.set('q', q);
    if (sort !== 'most_relevant') usp.set('sort', sort);
    if (filters.brands.length) usp.set('brands', filters.brands.join(','));
    if (filters.inStock) usp.set('in_stock', '1');
    if (filters.hasDiscount) usp.set('has_discount', '1');
    const qs = usp.toString();
    router.replace(qs ? `?${qs}` : '?', { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sort, q]);

  const query = useProductsInfinite({
    category,
    q,
    brands: fixedBrands ?? filters.brands,
    colors: filters.colors,
    attrs: filters.attrs,
    min_price: filters.minPrice,
    max_price: filters.maxPrice,
    in_stock: filters.inStock,
    has_discount: filters.hasDiscount,
    sort,
    per_page: 12,
  });

  const filtersQuery = useCategoryFilters(category, q);
  const filterSource = initialFilters ?? filtersQuery.data?.data;
  const brandsForFilters = searchMode ? filterSource : filterSource;

  // اسکرول بی‌نهایت
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && query.hasNextPage && !query.isFetchingNextPage) {
          void query.fetchNextPage();
        }
      },
      { rootMargin: '600px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [query.hasNextPage, query.isFetchingNextPage, query.fetchNextPage]);

  const products = useMemo(
    () => query.data?.pages.flatMap((p) => p.data) ?? [],
    [query.data],
  );
  const total = query.data?.pages[0]?.meta.total;
  useEffect(() => setRevealedCount(products.length), [products.length]);

  const chips: { key: string; label: string; onRemove: () => void }[] = [
    ...(fixedBrands ? [] : filters.brands.map((slug) => ({
      key: `b-${slug}`,
      label: `برند: ${filtersQuery.data?.data?.brands.find((b) => b.slug === slug)?.title ?? (initialFilters?.brands.find((b) => b.slug === slug)?.title ?? slug)}`,
      onRemove: () => setFilters((f) => ({ ...f, brands: f.brands.filter((x) => x !== slug) })),
    }))),
    ...filters.colors.map((id) => ({
      key: `c-${id}`,
      label: `رنگ: ${filterSource?.colors.find((c) => c.id === id)?.name ?? id}`,
      onRemove: () => setFilters((f) => ({ ...f, colors: f.colors.filter((x) => x !== id) })),
    })),
    ...filters.attrs.map((id) => ({
      key: `a-${id}`,
      label:
        filterSource?.attributes.flatMap((a) => a.values).find((v) => v.id === id)?.value ?? String(id),
      onRemove: () => setFilters((f) => ({ ...f, attrs: f.attrs.filter((x) => x !== id) })),
    })),
    ...(filters.minPrice != null || filters.maxPrice != null
      ? [{
          key: 'price',
          label: `قیمت: ${filters.minPrice ? formatPrice(filters.minPrice) : '۰'} تا ${filters.maxPrice ? formatPrice(filters.maxPrice) : '∞'}`,
          onRemove: () => setFilters((f) => ({ ...f, minPrice: undefined, maxPrice: undefined })),
        }]
      : []),
    ...(filters.inStock ? [{ key: 'stock', label: 'فقط موجود', onRemove: () => setFilters((f) => ({ ...f, inStock: false })) }] : []),
    ...(filters.hasDiscount ? [{ key: 'disc', label: 'فقط تخفیف‌دار', onRemove: () => setFilters((f) => ({ ...f, hasDiscount: false })) }] : []),
  ];

  return (
    <div className="container-page py-6">
      <div className="mb-5">
        {breadcrumb && <Breadcrumb items={breadcrumb} />}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {title && <h1 className="text-xl font-black text-zinc-900 dark:text-white sm:text-2xl">{title}</h1>}
          {q && <Badge tone="brand">{faDigits(total ?? 0)} نتیجه برای «{q}»</Badge>}
        </div>
      </div>

      <div className="flex items-start gap-6">
        <FilterSidebar
          filters={brandsForFilters}
          value={filters}
          onChange={setFilters}
          mobileOpen={mobileFilters}
          onCloseMobile={() => setMobileFilters(false)}
          total={total}
        />

        <div className="min-w-0 flex-1">
          <SortBar sort={sort} onChange={setSort} total={total} />

          {chips.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {chips.map((chip) => (
                <span key={chip.key} className="flex items-center gap-1.5 rounded-full border border-brand/25 bg-brand-soft px-3 py-1.5 text-[11px] font-bold text-brand dark:bg-brand/15">
                  {chip.label}
                  <button onClick={chip.onRemove} aria-label="حذف فیلتر" className="text-brand/60 hover:text-brand"><X size={12} /></button>
                </span>
              ))}
              <button onClick={() => setFilters(emptyFilters)} className="text-[11px] font-bold text-red-500 hover:underline">حذف همه</button>
            </div>
          )}

          {query.isLoading && <ListSkeleton count={8} />}
          {query.isError && <ErrorState onRetry={() => query.refetch()} />}
          {!query.isLoading && !query.isError && products.length === 0 && (
            <EmptyState
              icon="search"
              title="کالایی با این مشخصات یافت نشد"
              description="فیلترهای دیگری را امتحان کنید یا دسته‌بندی‌ها را مرور کنید."
              action={
                <button onClick={() => setFilters(emptyFilters)} className="mt-1 rounded-xl bg-brand-soft px-4 py-2 text-xs font-bold text-brand dark:bg-brand/15">
                  حذف فیلترها
                </button>
              }
            />
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <div key={p.id} className="surface">
                <ProductCard product={p} />
              </div>
            ))}
          </div>

          <div ref={sentinelRef} className="flex justify-center py-6">
            {query.isFetchingNextPage && <Spinner />}
            {!query.hasNextPage && products.length > 8 && (
              <p className="text-xs text-zinc-400">همه {faDigits(total ?? revealedCount)} کالا نمایش داده شد</p>
            )}
          </div>
        </div>
      </div>

      {/* دکمه فیلتر موبایل */}
      <button
        onClick={() => setMobileFilters(true)}
        className="fixed bottom-5 right-5 z-40 flex h-12 items-center gap-2 rounded-full bg-brand px-5 text-sm font-black text-white shadow-xl shadow-brand/30 lg:hidden"
      >
        <ListFilter size={17} /> فیلترها
      </button>
    </div>
  );
}
