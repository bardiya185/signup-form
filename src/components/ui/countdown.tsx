'use client';
import { faDigits, timeLeft } from '@/lib/format';
import { cn } from '@/utils/cn';
import { Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

export function CountdownTimer({
  target,
  light = false,
  showIcon = true,
  className,
}: {
  target: string;
  light?: boolean;
  showIcon?: boolean;
  className?: string;
}) {
  const [, force] = useState(0);
  useEffect(() => {
    const i = setInterval(() => force((x) => x + 1), 1000);
    return () => clearInterval(i);
  }, []);
  const t = timeLeft(target);
  if (t.expired) return null;

  const cell = (v: number) => (
    <span
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black tabular-nums',
        light ? 'bg-white/20 text-white' : 'bg-brand text-white',
      )}
    >
      {faDigits(v).padStart(2, '۰')}
    </span>
  );

  return (
    <div className={cn('inline-flex items-center gap-1', className)} dir="ltr" title="زمان باقی‌مانده">
      {showIcon && <Clock size={15} className={light ? 'text-white' : 'text-brand'} />}
      {t.days > 0 && (
        <>
          <span className={cn('text-xs font-bold', light ? 'text-white' : 'text-brand')}>{faDigits(t.days)} روز</span>
          <span className={light ? 'text-white/50' : 'text-zinc-300'}>:</span>
        </>
      )}
      {cell(t.hours)}
      <span className={light ? 'text-white/50' : 'text-zinc-300'}>:</span>
      {cell(t.minutes)}
      <span className={light ? 'text-white/50' : 'text-zinc-300'}>:</span>
      {cell(t.seconds)}
    </div>
  );
}
