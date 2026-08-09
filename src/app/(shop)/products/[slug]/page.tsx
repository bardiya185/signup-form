import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BadgeCheck, PackageCheck, RotateCcw } from 'lucide-react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { ProductGallery } from '@/components/product/product-gallery';
import { AddToCartBox } from '@/components/product/add-to-cart-box';
import { ProductTabs } from '@/components/product/product-tabs';
import { PriceChartButton } from '@/components/product/price-chart';
import { ProductCarousel } from '@/components/product/product-carousel';
import { StarRating } from '@/components/ui/rating';
import { Badge } from '@/components/ui/badge';
import { faDigits } from '@/lib/format';
import { RecentlyViewedTracker } from '@/components/product/recently-viewed';
import {
  findProductByParam, productDetailBySlug, relatedProducts,
} from '@/server/repositories/product.repository';
import { productQuestions } from '@/server/repositories/review.repository';

export const revalidate = 300; // ISR — بازتولید هر ۵ دقیقه

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const p = productDetailBySlug(slug);
  if (!p) return { title: 'محصول یافت نشد' };
  return {
    title: p.title,
    description: p.shortDescription ?? `خرید ${p.title} با بهترین قیمت از گینان‌کالا`,
    openGraph: {
      title: p.title,
      description: p.shortDescription ?? undefined,
      images: [p.image],
      type: 'website',
    },
    alternates: { canonical: `/products/${p.slug}` },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = productDetailBySlug(slug);
  if (!product) notFound();

  const raw = findProductByParam(slug)!;
  const related = relatedProducts(raw, 8);
  const questions = productQuestions(product.id);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: product.images.map((i) => i.url),
    description: product.shortDescription ?? product.title,
    brand: product.brand ? { '@type': 'Brand', name: product.brand.title } : undefined,
    aggregateRating:
      product.reviewCount > 0
        ? { '@type': 'AggregateRating', ratingValue: product.rating, reviewCount: product.reviewCount }
        : undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'IRR',
      price: product.effectivePrice * 10, // ریال
      availability:
        product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: product.breadcrumb.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.title,
    })),
  };

  const trustItems = [
    { icon: BadgeCheck, label: 'ضمانت اصالت کالا' },
    { icon: PackageCheck, label: 'تحویل اکسپرس' },
    { icon: RotateCcw, label: '۷ روز مهلت بازگشت' },
  ];

  return (
    <div className="container-page py-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <Breadcrumb
        items={[
          { title: 'خانه', href: '/' },
          ...product.breadcrumb.map((c) => ({ title: c.title, href: `/category/${c.slug}` })),
          { title: product.title },
        ]}
      />

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)_minmax(280px,3fr)]">
        {/* گالری */}
        <ProductGallery
          images={product.images}
          title={product.title}
          discountPercent={product.discountPercent}
          isIncredible={product.isIncredible}
        />

        {/* اطلاعات */}
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            {product.brand && (
              <a href={`/brand/${product.brand.slug}`} className="text-sky-600 hover:underline dark:text-sky-400">
                برند {product.brand.title}
              </a>
            )}
            {product.category && <span>/ {product.category.title}</span>}
          </div>
          <h1 className="mt-2 text-base font-black leading-8 text-zinc-900 dark:text-white sm:text-lg">
            {product.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-3 border-b border-dashed border-zinc-200 pb-4 dark:border-zinc-700">
            <StarRating value={product.rating} count={product.reviewCount} size={16} />
            <span className="text-xs text-zinc-400">{faDigits(product.questionsCount)} پرسش</span>
            <span className="text-xs text-zinc-400">{faDigits(product.viewCount)} بازدید</span>
            {product.isIncredible && <Badge tone="brand">پیشنهاد شگفت‌انگیز</Badge>}
          </div>

          {product.shortDescription && (
            <p className="mt-4 text-sm leading-7 text-zinc-600 dark:text-zinc-300">{product.shortDescription}</p>
          )}

          {/* رنگ‌های موجود */}
          {product.colors.length > 0 && (
            <div className="mt-4 flex items-center gap-1.5">
              {product.colors.map((c) => (
                <span key={c.id} title={c.name} className="size-4 rounded-full border border-black/10" style={{ backgroundColor: c.hex }} />
              ))}
            </div>
          )}

          <div className="mt-5"><PriceChartButton slug={product.slug} /></div>

          <ul className="mt-6 space-y-2.5 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            {trustItems.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                <Icon size={16} className="text-teal-500" /> {label}
              </li>
            ))}
          </ul>
        </div>

        {/* باکس خرید */}
        <AddToCartBox product={product} />
      </div>

      <ProductTabs product={product} questions={questions} />

      {related.length > 0 && (
        <ProductCarousel products={related} title="کالاهای مشابه" href={product.category ? `/category/${product.category.slug}` : undefined} />
      )}

      <RecentlyViewedTracker slug={product.slug} />
    </div>
  );
}
