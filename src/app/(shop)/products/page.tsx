import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ProductListing } from '@/components/product/product-listing';
import { ListSkeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'همه محصولات',
  description: 'مرور همه کالاهای گینان‌کالا با فیلتر برند، رنگ، قیمت و مرتب‌سازی پیشرفته.',
};

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="container py-8"><ListSkeleton /></div>}>
      <ProductListing
        title="همه محصولات"
        breadcrumb={[{ title: 'خانه', href: '/' }, { title: 'محصولات' }]}
      />
    </Suspense>
  );
}
