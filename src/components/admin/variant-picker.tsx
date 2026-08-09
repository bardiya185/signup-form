'use client';
/**
 * انتخاب‌گر تنوع محصول — جستجو → انتخاب محصول → انتخاب تنوع (برای فرم آفر ادمین)
 */
import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { Check, Search } from 'lucide-react';
import { http, type Envelope, type PaginatedEnv } from '@/lib/http';
import type { ProductCardDto } from '@/types/dto';
import { faDigits, formatPrice } from '@/lib/format';
import { cn } from '@/utils/cn';

interface VariantInfo {
  id: number; sku: string; price: number; salePrice: number | null; stock: number;
  color: { name: string } | null; size: { name: string } | null;
}

export function VariantPicker({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (variantId: number, productTitle: string, price: number) => void;
}) {
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<ProductCardDto | null>(null);

  const results = useQuery({
    queryKey: ['variant-picker', q],
    queryFn: () => http.get<PaginatedEnv<ProductCardDto>>('/products', { q, per_page: 6 }),
    enabled: q.trim().length >= 2,
  });

  const detail = useQuery({
    queryKey: ['variant-picker-detail', selected?.slug],
    queryFn: () => http.get<Envelope<{ product: { variants: VariantInfo[] } }>>(`/products/${selected!.slug}`),
    enabled: !!selected,
  });

  const products = useMemo(() => results.data?.data ?? [], [results.data]);

  return (
    <div className="space-y-2.5">
      <div className="relative">
        <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setSelected(null); }}
          placeholder="جستجوی محصول (حداقل ۲ حرف)…"
          className="h-10 w-full rounded-xl border border-zinc-200 bg-white pe-9 ps-3 text-sm outline-none focus:border-brand dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      {q.trim().length >= 2 && !selected && (
        <div className="max-h-56 space-y-1 overflow-y-auto rounded-xl border border-zinc-200 p-1.5 dark:border-zinc-700">
          {results.isLoading && <p className="p-2 text-xs text-zinc-400">در حال جستجو…</p>}
          {!results.isLoading && products.length === 0 && <p className="p-2 text-xs text-zinc-400">نتیجه‌ای یافت نشد.</p>}
          {products.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelected(p)}
              className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-start transition hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
            >
              <span className="relative size-9 shrink-0 overflow-hidden rounded-lg bg-zinc-50 dark:bg-zinc-800">
                <Image src={p.image} alt={p.title} fill className="object-contain p-0.5" sizes="36px" />
              </span>
              <span className="line-clamp-1 text-xs font-bold text-zinc-700 dark:text-zinc-200">{p.title}</span>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="space-y-1.5">
          <p className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-200">
            <span className="line-clamp-1">{selected.title}</span>
            <button type="button" onClick={() => setSelected(null)} className="shrink-0 text-[10px] font-bold text-sky-600 dark:text-sky-400">تغییر محصول</button>
          </p>
          {detail.isLoading && <p className="text-xs text-zinc-400">در حال بارگذاری تنوع‌ها…</p>}
          {detail.data?.data.product.variants.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => onChange(v.id, selected.title, v.salePrice ?? v.price)}
              className={cn(
                'flex w-full items-center justify-between rounded-xl border-2 px-3 py-2 text-xs transition',
                value === v.id
                  ? 'border-brand bg-brand-soft/60 dark:bg-brand/10'
                  : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-700',
              )}
            >
              <span className="flex items-center gap-2">
                {value === v.id && <Check size={14} className="text-brand" />}
                <span className="font-mono" dir="ltr">{v.sku}</span>
                {v.color && <span className="text-zinc-400">({v.color.name})</span>}
              </span>
              <span className="font-black text-zinc-800 dark:text-zinc-100">
                {formatPrice(v.salePrice ?? v.price)} <span className="font-normal text-zinc-400">ت</span>
                <span className="ms-2 font-normal text-zinc-400">({faDigits(v.stock)} عدد)</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
