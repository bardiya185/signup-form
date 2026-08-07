import { faPercent, formatPrice } from '@/lib/format';
import { cn } from '@/utils/cn';

export function PriceDisplay({
  price,
  originalPrice,
  discountPercent,
  size = 'md',
  className,
  showUnit = true,
}: {
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showUnit?: boolean;
}) {
  const hasDiscount = originalPrice != null && originalPrice > price;
  const pct = discountPercent ?? (hasDiscount ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0);
  const sizeMap = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl sm:text-3xl',
  } as const;
  const origSizeMap = { sm: 'text-[11px]', md: 'text-xs', lg: 'text-sm', xl: 'text-base' } as const;

  return (
    <div className={cn('flex flex-col items-end gap-1', className)}>
      {hasDiscount && pct > 0 && (
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-brand px-2 py-0.5 text-[11px] font-bold text-white">{faPercent(pct)}</span>
          <span className={cn('text-zinc-400 line-through decoration-red-400/60', origSizeMap[size])}>
            {formatPrice(originalPrice!)}
          </span>
        </div>
      )}
      <div className={cn('flex items-baseline gap-1 font-black text-zinc-900 dark:text-white', sizeMap[size])}>
        <span>{formatPrice(price)}</span>
        {showUnit && <span className="text-[11px] font-normal text-zinc-500 dark:text-zinc-400">تومان</span>}
      </div>
    </div>
  );
}
