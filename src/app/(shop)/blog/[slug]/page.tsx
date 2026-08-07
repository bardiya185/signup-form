'use client';
/**
 * صفحه مطلب بلاگ + مطالب مرتبط
 */
import { use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, Eye } from 'lucide-react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { http, type Envelope } from '@/lib/http';
import { EmptyState, PageLoading } from '@/components/ui/states';
import { Button } from '@/components/ui/button';
import { faDigits, jdate } from '@/lib/format';

interface BlogPost {
  id: number; title: string; slug: string; excerpt: string; body: string | null;
  image: string | null; authorName: string; viewCount: number; publishedAt: string;
}

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data, isLoading, isError } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: () => http.get<Envelope<{ post: BlogPost; related: BlogPost[] }>>(`/blog/${slug}`),
  });

  if (isLoading) return <PageLoading label="در حال بارگذاری مطلب…" />;
  if (isError || !data) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon="search"
          title="مطلب مورد نظر یافت نشد"
          action={<Link href="/blog"><Button size="sm">بازگشت به مجله</Button></Link>}
        />
      </div>
    );
  }

  const { post, related } = data.data;

  return (
    <div className="container-page max-w-4xl py-8">
      <Breadcrumb items={[{ title: 'خانه', href: '/' }, { title: 'مجله', href: '/blog' }, { title: post.title }]} />

      <article className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        {post.image && (
          <div className="relative aspect-[21/9] w-full">
            <Image src={post.image} alt={post.title} fill priority className="object-cover" sizes="(min-width:1024px) 896px, 100vw" />
          </div>
        )}
        <div className="p-6 sm:p-10">
          <h1 className="text-xl font-black leading-9 text-zinc-900 dark:text-white sm:text-2xl">{post.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-zinc-400">
            <span>{post.authorName}</span>
            <span className="flex items-center gap-1"><CalendarDays size={13} /> {jdate(post.publishedAt)}</span>
            <span className="flex items-center gap-1"><Eye size={13} /> {faDigits(post.viewCount)} بازدید</span>
          </div>
          <div className="mt-6 whitespace-pre-line text-sm leading-9 text-zinc-600 dark:text-zinc-300">
            {post.body ?? post.excerpt}
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-base font-black text-zinc-900 dark:text-white">مطالب مرتبط</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/blog/${r.slug}`}
                className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="relative aspect-[16/9] bg-zinc-100 dark:bg-zinc-800">
                  {r.image && (
                    <Image src={r.image} alt={r.title} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="33vw" />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-2 min-h-10 text-xs font-bold leading-5 text-zinc-800 group-hover:text-brand dark:text-zinc-100">{r.title}</h3>
                  <p className="mt-2 text-[10px] text-zinc-400">{jdate(r.publishedAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
