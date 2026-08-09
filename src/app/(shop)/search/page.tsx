import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ProductListing } from '@/components/product/product-listing';
import { ListSkeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'جستجو',
  description: 'جستجو در میان هزاران کالای گینان‌کالا.',
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const q = (await searchParams).q?.trim() ?? '';
  return (
    <Suspense fallback={<div className="container py-8"><ListSkeleton /></div>}>
      <ProductListing
        key={q}
        searchMode
        title={q ? `نتایج جستجو برای «${q}»` : 'جستجو'}
        breadcrumb={[{ title: 'خانه', href: '/' }, { title: 'جستجو' }]}
      />
    </Suspense>
  );
}
