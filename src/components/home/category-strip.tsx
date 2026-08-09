import { categoriesIcons } from './category-icons';
import type { CategoryNodeDto } from '@/types/dto';
import Image from 'next/image';
import Link from 'next/link';

export function CategoryStrip({ categories }: { categories: CategoryNodeDto[] }) {
  return (
    <section className="container-page pt-8">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6 lg:grid-cols-6">
        {categories.map((c) => {
          const Icon = categoriesIcons[c.icon ?? ''] ?? categoriesIcons.default;
          return (
            <Link
              key={c.id}
              href={`/category/${c.slug}`}
              className="group flex flex-col items-center gap-2.5 rounded-2xl border border-transparent bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:border-brand/20 hover:shadow-lg hover:shadow-brand/5 dark:bg-zinc-900 dark:hover:border-brand/30"
            >
              {c.image ? (
                <span className="relative h-14 w-14 overflow-hidden rounded-2xl">
                  <Image src={c.image} alt={c.title} fill sizes="56px" className="object-cover transition-transform duration-300 group-hover:scale-110" />
                </span>
              ) : (
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand transition-colors group-hover:bg-brand group-hover:text-white dark:bg-brand/15">
                  <Icon size={24} />
                </span>
              )}
              <span className="text-center text-[11px] font-bold leading-4 text-zinc-700 transition-colors group-hover:text-brand dark:text-zinc-200">
                {c.title}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
