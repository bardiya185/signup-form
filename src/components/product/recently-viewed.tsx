'use client';
/**
 * بازدیدهای اخیر — ثبت بازدید در localStorage + نمایش لیست «اخیراً دیده‌اید»
 */
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock3 } from 'lucide-react';
import { http, type Envelope } from '@/lib/http';
import type { ProductCardDto } from '@/types/dto';
import { ProductCard } from '@/components/product/product-card';

const KEY = 'gnk_recent';
const MAX = 12;

export const readRecentlyViewed = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]') as string[];
  } catch {
    return [];
  }
};

/** ثبت بازدید صفحه محصول (بدون خروجی رندر) */
export function RecentlyViewedTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const list = readRecentlyViewed().filter((s) => s !== slug);
    list.unshift(slug);
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  }, [slug]);
  return null;
}

/** بخش «کالاهایی که اخیراً دیده‌اید» — برای صفحه اصلی/سبد خرید */
export function RecentlyViewedSection({ exclude }: { exclude?: string }) {
  const [slugs, setSlugs] = useState<string[]>([]);
  useEffect(() => {
    setSlugs(readRecentlyViewed().filter((s) => s !== exclude).slice(0, 6));
  }, [exclude]);

  const { data } = useQuery({
    queryKey: ['recently-viewed', slugs],
    enabled: slugs.length > 0,
    queryFn: async () => {
      const items = await Promise.all(
        slugs.map((s) =>
          http.get<Envelope<{ product: unknown }>>(`/products/${s}`).then((r) => r.data.product as ProductCardDto).catch(() => null),
        ),
      );
      return items.filter(Boolean) as ProductCardDto[];
    },
    staleTime: 120_000,
  });

  if (!data?.length) return null;
  return (
    <section className="container-page py-8">
      <h2 className="mb-5 flex items-center gap-2 text-base font-black text-zinc-900 dark:text-white sm:text-lg">
        <Clock3 size={19} className="text-brand" /> اخیراً دیده‌اید
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {data.map((p) => <ProductCard key={p.id} product={p} compact />)}
      </div>
    </section>
  );
}
