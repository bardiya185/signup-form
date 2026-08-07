'use client';
import { faDigits } from '@/lib/format';
import { cn } from '@/utils/cn';
import { Star } from 'lucide-react';
import { useState } from 'react';

export function StarRating({
  value,
  count,
  size = 14,
  className,
  showValue = true,
}: {
  value: number;
  count?: number;
  size?: number;
  className?: string;
  showValue?: boolean;
}) {
  return (
    <div className={cn('inline-flex items-center gap-1', className)} dir="ltr">
      <div className="relative inline-flex items-center">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} size={size} className="fill-zinc-200 text-zinc-200 dark:fill-zinc-700 dark:text-zinc-700" />
          ))}
        </div>
        <div className="absolute inset-y-0 left-0 flex overflow-hidden" style={{ width: `${(value / 5) * 100}%` }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} size={size} className="shrink-0 fill-amber-400 text-amber-400" />
          ))}
        </div>
      </div>
      {showValue && value > 0 && (
        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{faDigits(value)}</span>
      )}
      {count != null && count > 0 && (
        <span className="text-[11px] text-zinc-400">({faDigits(count)})</span>
      )}
    </div>
  );
}

export function StarRatingInput({
  value,
  onChange,
  size = 28,
}: {
  value: number;
  onChange: (v: number) => void;
  size?: number;
}) {
  const [hover, setHover] = useState(0);
  const labels = ['', 'خیلی بد', 'بد', 'معمولی', 'خوب', 'عالی'];
  const active = hover || value;
  return (
    <div className="flex items-center gap-3" dir="ltr">
      <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setHover(i)}
            onClick={() => onChange(i)}
            className="transition-transform hover:scale-125 focus-visible:outline-none"
            aria-label={`${i} ستاره`}
          >
            <Star
              size={size}
              className={i <= active ? 'fill-amber-400 text-amber-400' : 'fill-zinc-200 text-zinc-200 dark:fill-zinc-700 dark:text-zinc-700'}
            />
          </button>
        ))}
      </div>
      {active > 0 && <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{labels[active]}</span>}
    </div>
  );
}
