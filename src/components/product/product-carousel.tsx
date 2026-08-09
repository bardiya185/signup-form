'use client';
import type { ProductCardDto } from '@/types/dto';
import { cn } from '@/utils/cn';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState, useEffect, type ReactNode } from 'react';
import { ProductCard } from './product-card';

export function ProductCarousel({
  products,
  title,
  href,
  headerAction,
}: {
  products: ProductCardDto[];
  title: string;
  href?: string;
  headerAction?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const update = () => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    // RTL: اسکرول به سمت چپ منفی است
    const pos = Math.abs(el.scrollLeft);
    setCanPrev(pos > 8);
    setCanNext(pos < max - 8);
  };

  useEffect(() => {
    update();
    const el = ref.current;
    el?.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el?.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [products]);

  const scroll = (dir: 'prev' | 'next') => {
    const el = ref.current;
    if (!el) return;
    const step = el.clientWidth * 0.85;
    el.scrollBy({ left: dir === 'next' ? -step : step, behavior: 'smooth' });
  };

  if (!products.length) return null;

  return (
    <section className="container-page py-8">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-black text-zinc-900 dark:text-white sm:text-xl">{title}</h2>
        <div className="flex items-center gap-2">
          {headerAction ?? (href && (
            <a href={href} className="flex items-center gap-1 text-xs font-bold text-brand hover:underline">
              مشاهده همه <ChevronLeft size={14} />
            </a>
          ))}
          <div className="hidden gap-1 sm:flex">
            <CarouselBtn onClick={() => scroll('prev')} disabled={!canPrev}><ChevronRight size={17} /></CarouselBtn>
            <CarouselBtn onClick={() => scroll('next')} disabled={!canNext}><ChevronLeft size={17} /></CarouselBtn>
          </div>
        </div>
      </div>
      <div
        ref={ref}
        className="scrollbar-none -mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2 pt-1"
      >
        {products.map((p) => (
          <div key={p.id} className="w-[47%] shrink-0 snap-start sm:w-[31%] lg:w-[23%] xl:w-[18.7%]">
            <div className="surface h-full">
              <ProductCard product={p} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CarouselBtn({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label="حرکت"
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition hover:border-brand hover:text-brand',
        'disabled:opacity-30 disabled:hover:border-zinc-200 disabled:hover:text-zinc-500 dark:border-zinc-700 dark:text-zinc-400',
      )}
    >
      {children}
    </button>
  );
}
