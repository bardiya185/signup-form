'use client';
import type { BannerDto } from '@/types/dto';
import { cn } from '@/utils/cn';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

export function HeroSlider({ banners }: { banners: BannerDto[] }) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const count = banners.length;

  const go = useCallback((next: number, direction = 1) => {
    setDir(direction);
    setIndex(((next % count) + count) % count);
  }, [count]);

  useEffect(() => {
    if (count <= 1) return;
    const t = setInterval(() => go(index + 1, 1), 6000);
    return () => clearInterval(t);
  }, [index, count, go]);

  if (!count) return null;

  return (
    <div className="group relative col-span-12 aspect-[16/7] overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800 sm:aspect-[16/6] lg:col-span-9 lg:aspect-auto lg:min-h-[300px]">
      <AnimatePresence initial={false} custom={dir}>
        <motion.div
          key={index}
          custom={dir}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
          className="absolute inset-0"
        >
          <Link href={banners[index].link ?? '#'} className="block h-full w-full">
            <Image
              src={banners[index].image}
              alt={banners[index].title}
              fill
              priority={index === 0}
              sizes="(max-width: 1024px) 100vw, 75vw"
              className="object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-5 pt-12">
              <p className="text-base font-black text-white drop-shadow sm:text-xl">{banners[index].title}</p>
            </div>
          </Link>
        </motion.div>
      </AnimatePresence>

      {count > 1 && (
        <>
          <div className="absolute bottom-4 left-4 flex gap-1.5">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i, i > index ? 1 : -1)}
                aria-label={`اسلاید ${i + 1}`}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  i === index ? 'w-7 bg-brand' : 'w-2 bg-white/60 hover:bg-white',
                )}
              />
            ))}
          </div>
          <div className="absolute left-3 top-1/2 flex -translate-y-1/2 flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            <button onClick={() => go(index + 1)} aria-label="بعدی" className="rounded-full bg-white/85 p-2 text-zinc-700 shadow-md backdrop-blur transition hover:bg-white">
              <ChevronLeft size={17} />
            </button>
            <button onClick={() => go(index - 1)} aria-label="قبلی" className="rounded-full bg-white/85 p-2 text-zinc-700 shadow-md backdrop-blur transition hover:bg-white">
              <ChevronRight size={17} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
