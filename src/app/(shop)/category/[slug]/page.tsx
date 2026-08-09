import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductListing } from '@/components/product/product-listing';
import { ListSkeleton } from '@/components/ui/skeleton';
import { categoryBreadcrumb, findCategoryBySlug } from '@/server/repositories/catalog.repository';
import { buildCategoryFilters } from '@/server/repositories/product.repository';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const category = findCategoryBySlug(slug);
  if (!category) return { title: 'دسته‌بندی یافت نشد' };
  return {
    title: `خرید ${category.title}`,
    description: `خرید آنلاین ${category.title} با بهترین قیمت و ضمانت اصالت کالا از گینان‌کالا.`,
  };
}

export default async function CategoryPage({ params }: { params: Params }) {
  const { slug } = await params;
  const category = findCategoryBySlug(slug);
  if (!category) notFound();

  const breadcrumbItems = categoryBreadcrumb(category);
  const initialFilters = buildCategoryFilters(slug);

  return (
    <Suspense fallback={<div className="container py-8"><ListSkeleton /></div>}>
      <ProductListing
        category={slug}
        title={category.title}
        initialFilters={initialFilters}
        breadcrumb={[
          { title: 'خانه', href: '/' },
          ...breadcrumbItems.slice(0, -1).map((c) => ({ title: c.title, href: `/category/${c.slug}` })),
          { title: category.title },
        ]}
      />
    </Suspense>
  );
}
