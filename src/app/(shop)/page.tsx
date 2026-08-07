import { homePayload } from '@/server/repositories/content.repository';
import { HeroSlider } from '@/components/home/hero-slider';
import { SideBanners } from '@/components/home/banners-duo';
import { CategoryStrip } from '@/components/home/category-strip';
import { IncredibleCarousel } from '@/components/home/incredible-carousel';
import { BrandStrip } from '@/components/home/brand-strip';
import { BlogStrip } from '@/components/home/blog-strip';
import { ProductCarousel } from '@/components/product/product-carousel';
import { RecentlyViewedSection } from '@/components/product/recently-viewed';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const data = homePayload();
  return (
    <div>
      {/* قهرمان */}
      <section className="container-page pt-4">
        <div className="grid grid-cols-12 gap-3">
          <HeroSlider banners={data.heroBanners} />
          <SideBanners banners={data.sidebarBanners} />
        </div>
      </section>

      <CategoryStrip categories={data.categories} />

      <IncredibleCarousel offers={data.incredibleOffers} endsAt={data.incredibleEndsAt} />

      <ProductCarousel products={data.featuredProducts} title="محصولات ویژه" href="/products" />

      <BrandStrip brands={data.brands} />

      <ProductCarousel products={data.bestSellingProducts} title="پرفروش‌ترین‌ها" href="/products?sort=best_selling" />

      <ProductCarousel products={data.newestProducts} title="جدیدترین محصولات" href="/products?sort=newest" />

      <RecentlyViewedSection />

      <BlogStrip />
    </div>
  );
}
