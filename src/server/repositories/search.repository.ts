import { db } from '../db';
import { toProductCardDto } from '../serializers';
import type { BrandDto, CategoryMiniDto, ProductCardDto } from '@/types/dto';

export interface SearchSuggestion {
  query: string;
  products: ProductCardDto[];
  categories: CategoryMiniDto[];
  brands: BrandDto[];
}

const normalize = (s: string) => s.trim().toLowerCase();

let searchLogSeq = 0;
function logSearch(query: string, resultsCount: number): void {
  db.search_logs.push({
    id: ++searchLogSeq,
    user_id: null,
    query,
    results_count: resultsCount,
    created_at: new Date().toISOString(),
  });
}

/** پیشنهاد جستجو — نسخه ساده؛ در پروداکشن به Meilisearch متصل می‌شود */
export function suggest(query: string): SearchSuggestion {
  const q = normalize(query);
  if (q.length < 2) return { query, products: [], categories: [], brands: [] };

  const products = db.products
    .filter((p) => p.status === 'active')
    .filter((p) => {
      const brand = db.brands.find((b) => b.id === p.brand_id);
      return normalize(
        `${p.title} ${p.short_description ?? ''} ${brand?.title ?? ''} ${brand?.slug ?? ''}`,
      ).includes(q);
    })
    .sort((a, b) => b.view_count - a.view_count)
    .slice(0, 6)
    .map(toProductCardDto);

  const categories = db.categories
    .filter((c) => c.is_active && normalize(c.title).includes(q))
    .slice(0, 4)
    .map((c) => ({ id: c.id, title: c.title, slug: c.slug }));

  const brands = db.brands
    .filter((b) => b.is_active && (normalize(b.title).includes(q) || normalize(b.slug).includes(q)))
    .slice(0, 4)
    .map((b) => ({ id: b.id, title: b.title, slug: b.slug, logo: b.logo }));

  logSearch(query, products.length);
  return { query, products, categories, brands };
}
