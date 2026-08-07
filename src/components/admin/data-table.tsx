'use client';
/**
 * جدول داده سبک پنل + صفحه‌بندی + نوار فیلتر/جستجو
 */
import type { ReactNode } from 'react';
import { Search } from 'lucide-react';
import { faDigits } from '@/lib/format';
import { cn } from '@/utils/cn';
import { Spinner } from '@/components/ui/states';

export function DataTable({
  head,
  children,
  loading,
  empty,
  emptyTitle = 'موردی یافت نشد',
}: {
  head: ReactNode[];
  children: ReactNode;
  loading?: boolean;
  empty?: boolean;
  emptyTitle?: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-start text-xs">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/80 text-[11px] text-zinc-400 dark:border-zinc-800 dark:bg-zinc-800/50">
              {head.map((h, i) => (
                <th key={i} className="px-4 py-3 text-start font-bold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/60">
            {loading ? (
              <tr>
                <td colSpan={head.length} className="py-14 text-center"><Spinner className="mx-auto" /></td>
              </tr>
            ) : empty ? (
              <tr>
                <td colSpan={head.length} className="py-14 text-center text-sm text-zinc-400">{emptyTitle}</td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const Tr = ({ children, className }: { children: ReactNode; className?: string }) => (
  <tr className={cn('text-zinc-600 transition hover:bg-zinc-50/70 dark:text-zinc-300 dark:hover:bg-zinc-800/40', className)}>{children}</tr>
);

export const Td = ({ children, className, dir }: { children: ReactNode; className?: string; dir?: 'ltr' | 'rtl' }) => (
  <td dir={dir} className={cn('px-4 py-3 align-middle', className)}>{children}</td>
);

export function Pagination({ page, lastPage, onChange }: { page: number; lastPage: number; onChange: (p: number) => void }) {
  if (lastPage <= 1) return null;
  return (
    <div className="mt-4 flex justify-center gap-1.5" dir="ltr">
      {Array.from({ length: lastPage }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={cn(
            'size-9 rounded-lg text-sm font-bold transition',
            p === page ? 'bg-brand text-white' : 'bg-white text-zinc-500 ring-1 ring-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-zinc-700',
          )}
        >
          {faDigits(p)}
        </button>
      ))}
    </div>
  );
}

/** نوار ابزار بالای جدول — جستجو + فیلترها */
export function TableToolbar({
  search,
  onSearch,
  placeholder = 'جستجو…',
  children,
}: {
  search?: string;
  onSearch?: (v: string) => void;
  placeholder?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2.5">
      {onSearch && (
        <div className="relative min-w-52 flex-1">
          <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={placeholder}
            className="h-10 w-full rounded-xl border border-zinc-200 bg-white pe-10 ps-4 text-sm outline-none transition focus:border-brand dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
      )}
      {children}
    </div>
  );
}

export function FilterPills({
  options,
  value,
  onChange,
  allLabel = 'همه',
}: {
  options: { value: string; label: string }[];
  value: string | undefined;
  onChange: (v: string | undefined) => void;
  allLabel?: string;
}) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1">
      <button
        onClick={() => onChange(undefined)}
        className={cn(
          'whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[11px] font-bold transition',
          value === undefined
            ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900'
            : 'border-zinc-200 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400',
        )}
      >
        {allLabel}
      </button>
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[11px] font-bold transition',
            value === o.value
              ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900'
              : 'border-zinc-200 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
