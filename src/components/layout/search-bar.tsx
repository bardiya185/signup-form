'use client';
import { usePopularSearches, useSearchSuggest } from '@/hooks/api';
import { useSearchStore } from '@/stores/search.store';
import { faDigits, formatPrice } from '@/lib/format';
import { Clock, Search, Tag, TrendingUp, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export function SearchBar({ onNavigate }: { onNavigate?: () => void }) {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const wrapRef = useRef<HTMLDivElement>(null);
  const { recent, addRecent, removeRecent, clearRecent } = useSearchStore();
  const suggestions = useSearchSuggest(debounced);
  const popular = usePopularSearches();

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 280);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const submit = (q: string) => {
    const v = q.trim();
    if (v.length < 2) return;
    addRecent(v);
    setOpen(false);
    setQuery('');
    onNavigate?.();
    router.push(`/search?q=${encodeURIComponent(v)}`);
  };

  const showSuggestions = debounced.trim().length >= 2 && suggestions.data;
  const box = suggestions.data?.data;

  return (
    <div ref={wrapRef} className="relative w-full">
      <form
        onSubmit={(e) => { e.preventDefault(); submit(query); }}
        className="flex h-11 items-center gap-2 rounded-xl bg-zinc-100 px-4 transition ring-brand/30 focus-within:bg-white focus-within:ring-2 dark:bg-zinc-800 dark:focus-within:bg-zinc-900"
      >
        <Search size={18} className="shrink-0 text-zinc-400" />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="جستجو در گینان‌کالا…"
          className="h-full w-full bg-transparent text-sm text-zinc-800 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
          aria-label="جستجو"
        />
        {query && (
          <button type="button" onClick={() => setQuery('')} aria-label="پاک کردن" className="text-zinc-400 hover:text-zinc-600">
            <X size={16} />
          </button>
        )}
      </form>

      {open && (recent.length > 0 || showSuggestions || query.trim().length < 2) && (
        <div className="absolute inset-x-0 top-full z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-2xl border border-zinc-100 bg-white p-3 shadow-2xl shadow-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-900">
          {/* جستجوهای اخیر */}
          {query.trim().length < 2 && recent.length > 0 && (
            <div className="mb-3">
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-500"><Clock size={13} /> جستجوهای اخیر</span>
                <button onClick={clearRecent} className="text-[11px] text-brand hover:underline">حذف همه</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recent.map((r) => (
                  <span key={r} className="group flex items-center gap-1.5 rounded-full bg-zinc-100 py-1.5 pl-2 pr-3 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    <button onClick={() => submit(r)} className="transition hover:text-brand">{r}</button>
                    <button onClick={() => removeRecent(r)} aria-label="حذف" className="text-zinc-400 hover:text-red-500"><X size={12} /></button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* پرطرفدار */}
          {query.trim().length < 2 && popular.data && (
            <div className="mb-1">
              <p className="mb-2 flex items-center gap-1.5 px-1 text-xs font-bold text-zinc-500"><TrendingUp size={13} /> جستجوهای پرطرفدار</p>
              <div className="flex flex-wrap gap-2">
                {popular.data.data.map((p) => (
                  <button
                    key={p.query}
                    onClick={() => submit(p.query)}
                    className="rounded-full border border-zinc-200 px-3 py-1.5 text-xs text-zinc-600 transition hover:border-brand hover:text-brand dark:border-zinc-700 dark:text-zinc-300"
                  >
                    {p.query}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* پیشنهادها */}
          {showSuggestions && (
            <div className="space-y-1">
              {box!.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 pb-2">
                  {box!.categories.map((c) => (
                    <Link
                      key={c.id}
                      href={`/category/${c.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-1 rounded-full bg-brand-soft px-3 py-1.5 text-xs font-bold text-brand dark:bg-brand/20 dark:text-red-300"
                    >
                      <Tag size={12} /> {c.title}
                    </Link>
                  ))}
                </div>
              )}
              {box!.products.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  onClick={() => { addRecent(debounced); setOpen(false); }}
                  className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                    <Image src={p.image} alt={p.title} fill sizes="48px" className="object-cover" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium text-zinc-700 dark:text-zinc-200">{p.title}</span>
                    <span className="mt-0.5 block text-[11px] font-bold text-zinc-900 dark:text-white">
                      {formatPrice(p.effectivePrice)} <span className="font-normal text-zinc-400">تومان</span>
                    </span>
                  </span>
                  {p.discountPercent > 0 && (
                    <span className="rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-bold text-white">٪{faDigits(p.discountPercent)}</span>
                  )}
                </Link>
              ))}
              {box!.products.length === 0 && (
                <p className="py-4 text-center text-xs text-zinc-400">موردی یافت نشد؛ برای «{debounced}» جستجو کنید</p>
              )}
              <button
                onClick={() => submit(debounced)}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-100 py-2.5 text-xs font-bold text-zinc-600 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                <Search size={14} /> مشاهده همه نتایج برای «{debounced}»
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
