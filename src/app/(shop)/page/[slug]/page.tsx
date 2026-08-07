import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { pageBySlug } from '@/server/repositories/content.repository';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const page = pageBySlug(slug);
  if (!page) return { title: 'صفحه یافت نشد' };
  return { title: page.title, description: page.body.slice(0, 160) };
}

/** صفحات CMS (درباره ما، قوانین، حریم خصوصی و…) — رندر سروری ایستا */
export default async function CmsPage({ params }: { params: Params }) {
  const { slug } = await params;
  const page = pageBySlug(slug);
  if (!page) notFound();

  return (
    <div className="container-page max-w-4xl py-10">
      <Breadcrumb items={[{ title: 'خانه', href: '/' }, { title: page.title }]} />
      <article className="mt-6 rounded-2xl border border-zinc-200 bg-white p-7 dark:border-zinc-800 dark:bg-zinc-900 sm:p-10">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white">{page.title}</h1>
        <div className="prose prose-sm mt-6 max-w-none whitespace-pre-line leading-9 text-zinc-600 dark:text-zinc-300">
          {page.body}
        </div>
      </article>
    </div>
  );
}
