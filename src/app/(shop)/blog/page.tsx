'use client';
/**
 * مجله گینان‌کالا — لیست مطالب با صفحه‌بندی
 */
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { Newspaper } from 'lucide-react';
import { http, type PaginatedEnv } from '@/lib/http';
import { EmptyState, Spinner } from '@/components/ui/states';
import { faDigits, jdate } from '@/lib/format';
import { cn } from '@/utils/cn';

interface BlogItem {
  id: number; title: string; slug: string; excerpt: string;
  image: string | null; authorName: string; viewCount: number; publishedAt: string;
}

export default function BlogPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ['blog', page],
    queryFn: () => http.get<PaginatedEnv<BlogItem>>('/blog', { page, per_page: 9 }),
  });

  const items = data?.data ?? [];

  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <h1 className="flex items-center gap-2 text-2xl font-black text-zinc-900 dark:text-white">
          <Newspaper size={24} className="text-brand" /> مجله گینان‌کالا
        </h1>
        <p className="mt-2 text-sm text-zinc-400">راهنمای خرید، معرفی محصول و آخرین اخبار دنیای تکنولوژی</p>
      </div>

      {isLoading && <div className="flex justify-center py-16"><Spinner size={32} /></div>}

      {data && items.length === 0 && (
        <EmptyState icon="search" title="مطلبی منتشر نشده است" />
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:-translate-y-1 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="relative aspect-[16/9] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
              {post.image && (
                <Image src={post.image} alt={post.title} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(min-width:1024px) 33vw, 100vw" />
              )}
            </div>
            <div className="p-5">
              <h2 className="line-clamp-2 min-h-12 text-sm font-black leading-6 text-zinc-900 group-hover:text-brand dark:text-white">
                {post.title}
              </h2>
              <p className="mt-2 line-clamp-2 text-xs leading-6 text-zinc-500 dark:text-zinc-400">{post.excerpt}</p>
              <div className="mt-4 flex items-center justify-between border-t border-dashed border-zinc-100 pt-3 text-[11px] text-zinc-400 dark:border-zinc-800">
                <span>{post.authorName}</span>
                <span>{jdate(post.publishedAt)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {data && data.meta.last_page > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: data.meta.last_page }, (_, i) => i + 1).map((p) => (
            <button
              key={p} onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className={cn('size-10 rounded-xl text-sm font-bold', p === page ? 'bg-brand text-white' : 'bg-white text-zinc-600 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-zinc-700')}
            >
              {faDigits(p)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
