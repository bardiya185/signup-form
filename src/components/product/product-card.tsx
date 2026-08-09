'use client';
import { useToggleCompare, useToggleWishlist } from '@/hooks/api';
import { faDigits } from '@/lib/format';
import { cn } from '@/utils/cn';
import type { ProductCardDto } from '@/types/dto';
import { Badge } from '@/components/ui/badge';
import { PriceDisplay } from '@/components/ui/price';
import { StarRating } from '@/components/ui/rating';
import { Flame, GitCompareArrows, Heart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

export function ProductCard({ product, compact = false }: { product: ProductCardDto; compact?: boolean }) {
  const outOfStock = product.stock <= 0;
  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <Link
        href={`/products/${product.slug}`}
        className={cn(
          'group relative flex h-full flex-col rounded-2xl border border-transparent bg-white p-3 transition-all duration-300 hover:-translate-y-1 hover:border-zinc-100 hover:shadow-xl hover:shadow-zinc-900/[.07] dark:bg-zinc-900 dark:hover:border-zinc-700',
          outOfStock && 'opacity-70',
        )}
      >
        {/* تصویر */}
        <div className="relative aspect-square overflow-hidden rounded-xl bg-zinc-50 dark:bg-zinc-800">
          <Image
            src={product.image}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className={cn('object-cover transition-transform duration-500 group-hover:scale-[1.06]', outOfStock && 'grayscale')}
          />
          {product.isIncredible && (
            <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-brand px-2 py-1 text-[10px] font-black text-white shadow-lg shadow-brand/30">
              <Flame size={11} /> شگفت‌انگیز
            </span>
          )}
          {outOfStock && (
            <span className="absolute inset-x-0 bottom-0 bg-zinc-900/70 py-1.5 text-center text-[11px] font-bold text-white">
              ناموجود
            </span>
          )}
        </div>

        {/* محتوا */}
        <div className="flex flex-1 flex-col pt-3">
          {product.brand && !compact && (
            <span className="text-[10px] font-bold text-zinc-400">{product.brand.title}</span>
          )}
          <h3 className={cn(
            'mb-auto text-[13px] leading-6 text-zinc-700 transition-colors group-hover:text-brand dark:text-zinc-200',
            compact ? 'line-clamp-1' : 'line-clamp-2 min-h-[3rem]',
          )}>
            {product.title}
          </h3>

          {!compact && (
            <div className="mt-2 flex items-center justify-between">
              <StarRating value={product.rating} count={product.reviewCount} size={12} />
              {product.colors.length > 0 && (
                <div className="flex -space-x-1 space-x-reverse">
                  {product.colors.slice(0, 4).map((c) => (
                    <span key={c.id} title={c.name} className="h-3.5 w-3.5 rounded-full border border-white ring-1 ring-zinc-200 dark:border-zinc-900 dark:ring-zinc-700" style={{ backgroundColor: c.hex }} />
                  ))}
                  {product.colors.length > 4 && (
                    <span className="text-[9px] text-zinc-400">+{faDigits(product.colors.length - 4)}</span>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="mt-2 flex items-end justify-between gap-2 border-t border-dashed border-zinc-100 pt-2.5 dark:border-zinc-800">
            <div className="flex flex-col gap-1">
              {product.discountPercent > 0 && (
                <Badge tone="brand" className="w-fit">٪{faDigits(product.discountPercent)} تخفیف</Badge>
              )}
              {!outOfStock && product.stock <= 3 && product.stock > 0 && (
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                  تنها {faDigits(product.stock)} عدد مانده
                </span>
              )}
            </div>
            <PriceDisplay
              price={product.effectivePrice}
              originalPrice={product.discountPercent > 0 ? product.price : undefined}
              discountPercent={0}
              size={compact ? 'sm' : 'md'}
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/** دکمه‌های اکشن شناور روی کارت (قلب/مقایسه) */
export function CardActions({ productId, className }: { productId: number; className?: string }) {
  const wishlist = useToggleWishlist();
  const compare = useToggleCompare();
  const btn =
    'flex h-8 w-8 items-center justify-center rounded-full bg-white text-zinc-400 shadow-md transition hover:text-brand dark:bg-zinc-800';
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <button className={btn} aria-label="علاقه‌مندی" onClick={(e) => { e.preventDefault(); wishlist.mutate({ productId }); }}>
        <Heart size={15} />
      </button>
      <button className={btn} aria-label="مقایسه" onClick={(e) => { e.preventDefault(); compare.mutate({ productId }); }}>
        <GitCompareArrows size={15} />
      </button>
    </div>
  );
}
