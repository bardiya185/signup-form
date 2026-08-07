'use client';
/**
 * گالری تصاویر محصول — تصویر اصلی + بندانگشتی‌ها + اکشن‌های سریع
 */
import { useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { Expand } from 'lucide-react';
import { faPercent } from '@/lib/format';
import { cn } from '@/utils/cn';
import { Modal } from '@/components/ui/modal';
import type { ProductImageDto } from '@/types/dto';

export function ProductGallery({
  images,
  title,
  discountPercent,
  isIncredible,
}: {
  images: ProductImageDto[];
  title: string;
  discountPercent: number;
  isIncredible: boolean;
}) {
  const sorted = [...images].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const current = sorted[Math.min(active, sorted.length - 1)];

  return (
    <div className="flex gap-3">
      {/* بندانگشتی‌ها */}
      {sorted.length > 1 && (
        <div className="hidden w-16 shrink-0 flex-col gap-2 sm:flex">
          {sorted.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onMouseEnter={() => setActive(i)}
              onClick={() => setActive(i)}
              className={cn(
                'relative aspect-square overflow-hidden rounded-xl border bg-white transition dark:bg-zinc-900',
                i === active
                  ? 'border-brand ring-2 ring-brand/25'
                  : 'border-zinc-200 opacity-70 hover:opacity-100 dark:border-zinc-700',
              )}
              aria-label={`تصویر ${i + 1}`}
            >
              <Image src={img.url} alt={img.alt || title} fill className="object-contain p-1.5" sizes="64px" />
            </button>
          ))}
        </div>
      )}

      {/* تصویر اصلی */}
      <div className="relative flex-1">
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <AnimatePresence mode="wait">
            <motion.div
              key={current?.id ?? 'empty'}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.22 }}
              className="absolute inset-0"
            >
              {current && (
                <Image
                  src={current.url}
                  alt={current.alt || title}
                  fill
                  priority
                  className="object-contain p-4 sm:p-8"
                  sizes="(min-width: 1024px) 40vw, 100vw"
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* نشان تخفیف */}
          {discountPercent > 0 && (
            <span className={cn(
              'absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-black text-white shadow-lg',
              isIncredible ? 'bg-brand' : 'bg-red-500',
            )}>
              {faPercent(discountPercent)}
            </span>
          )}

          <button
            type="button"
            onClick={() => setZoomed(true)}
            className="absolute bottom-3 left-3 flex size-9 items-center justify-center rounded-full border border-zinc-200 bg-white/90 text-zinc-500 backdrop-blur transition hover:text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900/90 dark:hover:text-zinc-200"
            aria-label="بزرگ‌نمایی تصویر"
          >
            <Expand size={16} />
          </button>
        </div>

        {/* نقاط موبایل */}
        {sorted.length > 1 && (
          <div className="mt-3 flex justify-center gap-1.5 sm:hidden">
            {sorted.map((img, i) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`تصویر ${i + 1}`}
                className={cn('size-1.5 rounded-full transition', i === active ? 'w-4 bg-brand' : 'bg-zinc-300 dark:bg-zinc-600')}
              />
            ))}
          </div>
        )}
      </div>

      {/* مودال بزرگ‌نمایی */}
      <Modal open={zoomed} onClose={() => setZoomed(false)} title={title} size="lg">
        {current && (
          <div className="relative aspect-square w-full">
            <Image src={current.url} alt={current.alt || title} fill className="object-contain" sizes="90vw" />
          </div>
        )}
      </Modal>
    </div>
  );
}
