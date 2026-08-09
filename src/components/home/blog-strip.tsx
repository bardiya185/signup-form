import { blogList } from '@/server/repositories/content.repository';
import { jdate } from '@/lib/format';
import { CalendarDays } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function BlogStrip() {
  const { items } = blogList(1, 3);
  if (!items.length) return null;
  return (
    <section className="container-page py-8">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-black text-zinc-900 dark:text-white sm:text-xl">خواندنی‌های گینان‌کالا</h2>
        <Link href="/blog" className="text-xs font-bold text-brand hover:underline">مشاهده همه ←</Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {items.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="group surface overflow-hidden">
            <div className="relative aspect-[16/9] overflow-hidden">
              {post.image && (
                <Image src={post.image} alt={post.title} fill sizes="33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
              )}
            </div>
            <div className="p-4">
              <h3 className="line-clamp-2 min-h-[3rem] text-sm font-black leading-6 text-zinc-800 transition-colors group-hover:text-brand dark:text-zinc-100">
                {post.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{post.excerpt}</p>
              <p className="mt-3 flex items-center gap-1.5 text-[11px] text-zinc-400">
                <CalendarDays size={12} /> {jdate(post.published_at, 'medium')}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
