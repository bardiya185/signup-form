'use client';
import { faDigits } from '@/lib/format';
import { cn } from '@/utils/cn';
import { Minus, Plus, Trash2 } from 'lucide-react';

export function QuantityInput({
  value,
  onChange,
  max,
  min = 1,
  size = 'md',
  loading,
}: {
  value: number;
  onChange: (v: number) => void;
  max: number;
  min?: number;
  size?: 'sm' | 'md';
  loading?: boolean;
}) {
  const btn = cn(
    'flex items-center justify-center text-brand transition hover:bg-brand-soft disabled:opacity-30 dark:hover:bg-brand/20',
    size === 'sm' ? 'h-8 w-8' : 'h-10 w-10',
  );
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900',
        loading && 'pointer-events-none opacity-60',
      )}
    >
      <button type="button" className={btn} disabled={value >= max || loading} onClick={() => onChange(value + 1)} aria-label="افزایش">
        <Plus size={16} />
      </button>
      <span className={cn('min-w-8 text-center font-black text-zinc-800 tabular-nums dark:text-zinc-100', size === 'sm' ? 'text-xs' : 'text-sm')}>
        {faDigits(value)}
      </span>
      <button
        type="button"
        className={btn}
        disabled={value <= min || loading}
        onClick={() => onChange(value - 1)}
        aria-label={value <= 1 ? 'حذف' : 'کاهش'}
      >
        {value <= 1 ? <Trash2 size={15} /> : <Minus size={16} />}
      </button>
    </div>
  );
}
