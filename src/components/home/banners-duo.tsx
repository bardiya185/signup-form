import type { BannerDto } from '@/types/dto';
import Image from 'next/image';
import Link from 'next/link';

export function SideBanners({ banners }: { banners: BannerDto[] }) {
  return (
    <div className="col-span-12 hidden flex-col gap-3 lg:col-span-3 lg:flex">
      {banners.slice(0, 2).map((b) => (
        <Link key={b.id} href={b.link ?? '#'} className="group relative flex-1 overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800">
          <Image src={b.image} alt={b.title} fill sizes="25vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent p-4 pt-8">
            <p className="text-sm font-black text-white">{b.title}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
