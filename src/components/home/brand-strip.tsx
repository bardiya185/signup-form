import type { BrandDto } from '@/types/dto';
import Link from 'next/link';

export function BrandStrip({ brands }: { brands: BrandDto[] }) {
  return (
    <section className="container-page py-8">
      <div className="surface overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-5">
          <h2 className="text-lg font-black text-zinc-900 dark:text-white">برندهای محبوب</h2>
          <Link href="/products" className="text-xs font-bold text-brand hover:underline">مشاهده همه ←</Link>
        </div>
        <div className="scrollbar-none flex gap-3 overflow-x-auto px-6 py-5">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/brand/${brand.slug}`}
              className="flex h-16 min-w-[8.5rem] shrink-0 items-center justify-center rounded-2xl border border-zinc-100 bg-zinc-50/50 text-sm font-black text-zinc-500 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/30 hover:text-brand dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-300 dark:hover:text-white"
            >
              {brand.title}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
