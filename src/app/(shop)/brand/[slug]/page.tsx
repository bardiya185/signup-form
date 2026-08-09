import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { ProductListing } from '@/components/product/product-listing';
import { ListSkeleton } from '@/components/ui/skeleton';
import { listBrands } from '@/server/repositories/catalog.repository';
import { buildCategoryFilters } from '@/server/repositories/product.repository';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const brand = listBrands().find((b) => b.slug === slug);
  if (!brand) return { title: 'برند یافت نشد' };
  return {
    title: `محصولات برند ${brand.title}`,
    description: `خرید محصولات اورجینال برند ${brand.title} با ضمانت اصالت از گینان‌کالا.`,
  };
}

export default async function BrandPage({ params }: { params: Params }) {
  const { slug } = await params;
  const brand = listBrands().find((b) => b.slug === slug);
  if (!brand) notFound();

  return (
    <div>
      <div className="container pt-6">
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
          {brand.logo && (
            <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-border bg-background p-2">
              <Image src={brand.logo} alt={brand.title} fill className="object-contain" sizes="64px" />
            </div>
          )}
          <div>
            <h1 className="text-lg font-bold">محصولات برند {brand.title}</h1>
            <p className="mt-1 text-xs text-muted-foreground">اصالت کالای این برند توسط گینان‌کالا تضمین می‌شود.</p>
          </div>
        </div>
      </div>
      <Suspense fallback={<div className="container py-8"><ListSkeleton /></div>}>
        <ProductListing
          fixedBrands={[brand.slug]}
          breadcrumb={[{ title: 'خانه', href: '/' }, { title: 'برندها' }, { title: brand.title }]}
          initialFilters={buildCategoryFilters()}
        />
      </Suspense>
    </div>
  );
}
