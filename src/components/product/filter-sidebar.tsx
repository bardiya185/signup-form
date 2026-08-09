'use client';
import type { CategoryFiltersDto } from '@/types/dto';
import { enThousands, faDigits, formatPrice } from '@/lib/format';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';
import { ChevronDown, Search, SlidersHorizontal, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';

export interface FilterState {
  brands: string[];
  colors: number[];
  attrs: number[];
  minPrice?: number;
  maxPrice?: number;
  inStock: boolean;
  hasDiscount: boolean;
}

export const emptyFilters: FilterState = {
  brands: [], colors: [], attrs: [], inStock: false, hasDiscount: false,
};

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-zinc-100 py-4 last:border-0 dark:border-zinc-800">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between text-sm font-black text-zinc-800 dark:text-zinc-100">
        {title}
        <ChevronDown size={15} className={cn('text-zinc-400 transition-transform', !open && 'rotate-180')} />
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button onClick={() => onChange(!checked)} className="flex w-full items-center justify-between py-1.5 text-[13px] font-medium text-zinc-600 dark:text-zinc-300">
      {label}
      <span className={cn('relative h-6 w-11 rounded-full transition', checked ? 'bg-brand' : 'bg-zinc-200 dark:bg-zinc-700')}>
        <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all', checked ? 'right-[22px]' : 'right-0.5')} />
      </span>
    </button>
  );
}

export function FilterSidebar({
  filters,
  value,
  onChange,
  mobileOpen,
  onCloseMobile,
  total,
}: {
  filters?: CategoryFiltersDto;
  value: FilterState;
  onChange: (v: FilterState) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  total?: number;
}) {
  const [brandQuery, setBrandQuery] = useState('');
  const [minInput, setMinInput] = useState(value.minPrice?.toString() ?? '');
  const [maxInput, setMaxInput] = useState(value.maxPrice?.toString() ?? '');

  const brands = useMemo(() => {
    const list = filters?.brands ?? [];
    if (!brandQuery.trim()) return list;
    return list.filter((b) => b.title.includes(brandQuery.trim()) || b.slug.includes(brandQuery.trim().toLowerCase()));
  }, [filters, brandQuery]);

  const toggleIn = <T,>(arr: T[], item: T): T[] =>
    arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];

  const activeCount =
    value.brands.length + value.colors.length + value.attrs.length +
    (value.minPrice != null || value.maxPrice != null ? 1 : 0) +
    (value.inStock ? 1 : 0) + (value.hasDiscount ? 1 : 0);

  const applyPrice = () => {
    const min = minInput ? Number(minInput.replace(/\D/g, '')) : undefined;
    const max = maxInput ? Number(maxInput.replace(/\D/g, '')) : undefined;
    onChange({ ...value, minPrice: min || undefined, maxPrice: max || undefined });
  };

  const content = (
    <div className="px-5 pb-5">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
        <span className="flex items-center gap-2 text-sm font-black text-zinc-900 dark:text-white">
          <SlidersHorizontal size={16} className="text-brand" /> فیلترها
          {activeCount > 0 && <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-black text-white">{faDigits(activeCount)}</span>}
        </span>
        {activeCount > 0 && (
          <button onClick={() => { onChange(emptyFilters); setMinInput(''); setMaxInput(''); }} className="flex items-center gap-1 text-[11px] font-bold text-red-500 hover:underline">
            <Trash2 size={12} /> حذف فیلترها
          </button>
        )}
      </div>

      <Section title="برند">
        {filters?.brands && filters.brands.length > 4 && (
          <div className="mb-2 flex h-9 items-center gap-2 rounded-xl bg-zinc-100 px-3 dark:bg-zinc-800">
            <Search size={14} className="text-zinc-400" />
            <input value={brandQuery} onChange={(e) => setBrandQuery(e.target.value)} placeholder="جستجوی برند…" className="w-full bg-transparent text-xs outline-none dark:text-zinc-100" />
          </div>
        )}
        <div className="max-h-52 space-y-1 overflow-y-auto pe-1">
          {brands.map((b) => (
            <label key={b.id} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1.5 text-[13px] text-zinc-600 transition hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800">
              <input
                type="checkbox"
                checked={value.brands.includes(b.slug)}
                onChange={() => onChange({ ...value, brands: toggleIn(value.brands, b.slug) })}
                className="h-4 w-4 rounded border-zinc-300 accent-[#ef4056]"
              />
              <span className="flex-1">{b.title}</span>
              <span className="text-[10px] text-zinc-300 dark:text-zinc-600">{faDigits(b.count)}</span>
            </label>
          ))}
          {brands.length === 0 && <p className="py-2 text-xs text-zinc-400">برندی یافت نشد</p>}
        </div>
      </Section>

      {filters?.colors && filters.colors.length > 0 && (
        <Section title="رنگ">
          <div className="flex flex-wrap gap-2.5">
            {filters.colors.map((c) => {
              const active = value.colors.includes(c.id);
              return (
                <button
                  key={c.id}
                  title={c.name}
                  onClick={() => onChange({ ...value, colors: toggleIn(value.colors, c.id) })}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full border py-1 pl-3 pr-1 text-[11px] transition',
                    active
                      ? 'border-brand bg-brand-soft font-bold text-brand dark:bg-brand/15'
                      : 'border-zinc-200 text-zinc-500 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-400',
                  )}
                >
                  <span className="h-4 w-4 rounded-full border border-zinc-200 dark:border-zinc-600" style={{ backgroundColor: c.hex }} />
                  {c.name}
                </button>
              );
            })}
          </div>
        </Section>
      )}

      {(filters?.attributes ?? []).map((attr) => (
        <Section key={attr.id} title={attr.title} defaultOpen={false}>
          <div className="max-h-44 space-y-1 overflow-y-auto pe-1">
            {attr.values.map((v) => (
              <label key={v.id} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1.5 text-[13px] text-zinc-600 transition hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800">
                <input
                  type="checkbox"
                  checked={value.attrs.includes(v.id)}
                  onChange={() => onChange({ ...value, attrs: toggleIn(value.attrs, v.id) })}
                  className="h-4 w-4 rounded border-zinc-300 accent-[#ef4056]"
                />
                <span className="flex-1">{v.value}</span>
                <span className="text-[10px] text-zinc-300 dark:text-zinc-600">{faDigits(v.count)}</span>
              </label>
            ))}
          </div>
        </Section>
      ))}

      <Section title="محدوده قیمت (تومان)">
        <div className="grid grid-cols-2 gap-2" dir="ltr">
          <input
            value={maxInput} onChange={(e) => setMaxInput(e.target.value)}
            placeholder={`تا ${filters ? enThousands(filters.priceRange.max) : ''}`}
            inputMode="numeric"
            className="h-10 rounded-xl border border-zinc-200 px-3 text-center text-xs text-zinc-700 outline-none focus:border-brand dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          />
          <input
            value={minInput} onChange={(e) => setMinInput(e.target.value)}
            placeholder={`از ${filters ? enThousands(filters.priceRange.min) : ''}`}
            inputMode="numeric"
            className="h-10 rounded-xl border border-zinc-200 px-3 text-center text-xs text-zinc-700 outline-none focus:border-brand dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          />
        </div>
        <Button variant="secondary" size="sm" className="mt-2 w-full" onClick={applyPrice}>اعمال بازه قیمت</Button>
        {filters && (
          <p className="mt-2 text-center text-[10px] text-zinc-400">
            {formatPrice(filters.priceRange.min)} تا {formatPrice(filters.priceRange.max)} تومان
          </p>
        )}
      </Section>

      <div className="pt-4">
        <Toggle checked={value.inStock} onChange={(v) => onChange({ ...value, inStock: v })} label="فقط کالاهای موجود" />
        <Toggle checked={value.hasDiscount} onChange={(v) => onChange({ ...value, hasDiscount: v })} label="فقط کالاهای تخفیف‌دار" />
      </div>

      <button className="mt-4 h-11 w-full rounded-xl bg-brand text-sm font-black text-white lg:hidden" onClick={onCloseMobile}>
        مشاهده {total != null ? faDigits(total) : ''} کالا
      </button>
    </div>
  );

  return (
    <>
      {/* دسکتاپ */}
      <aside className="sticky top-[130px] hidden max-h-[calc(100dvh-150px)] w-64 shrink-0 overflow-y-auto rounded-2xl border border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900 lg:block">
        {content}
      </aside>
      {/* موبایل — کشو */}
      <div className={cn('fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm transition-opacity lg:hidden', mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0')} onClick={onCloseMobile} />
      <aside className={cn(
        'fixed inset-x-0 bottom-0 z-[75] max-h-[85dvh] overflow-y-auto rounded-t-3xl bg-white transition-transform duration-300 dark:bg-zinc-950 lg:hidden',
        mobileOpen ? 'translate-y-0' : 'translate-y-full',
      )}>
        <div className="sticky top-0 z-10 flex items-center justify-between bg-white px-5 pt-4 dark:bg-zinc-950">
          <span className="text-sm font-black dark:text-white">فیلترها</span>
          <button onClick={onCloseMobile} aria-label="بستن" className="text-zinc-400"><X size={20} /></button>
        </div>
        {content}
      </aside>
    </>
  );
}
