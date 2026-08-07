import { buildCategoryFilters, queryProducts } from '@/server/repositories/product.repository';
import { intParam, paginationMeta } from '@/server/http';
import { NextResponse } from 'next/server';
import type { ProductSort } from '@/types/dto';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

const SORTS: ProductSort[] = [
  'most_relevant', 'best_selling', 'most_viewed', 'highest_rated',
  'newest', 'price_asc', 'price_desc', 'highest_discount',
];

const csv = (raw: string | null): string[] =>
  raw ? raw.split(',').map((s) => s.trim()).filter(Boolean) : [];

// GET /api/v1/products — لیست محصولات با فیلتر، مرتب‌سازی و صفحه‌بندی
// ?category=mobile&brands=apple,samsung&colors=1,2&attrs=2,6&q=آیفون
// &min_price=&max_price=&in_stock=1&has_discount=1&sort=price_asc&page=1&per_page=12&with_filters=1
export function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const sortRaw = sp.get('sort') ?? 'most_relevant';
  const sort = (SORTS.includes(sortRaw as ProductSort) ? sortRaw : 'most_relevant') as ProductSort;

  const numericCsv = (raw: string | null) =>
    csv(raw).map(Number).filter((n) => Number.isFinite(n));

  const page = Math.max(1, intParam(sp.get('page'), 1));
  const perPage = Math.min(48, Math.max(1, intParam(sp.get('per_page'), 12)));

  const { items, total } = queryProducts({
    categorySlug: sp.get('category') ?? undefined,
    brandSlugs: csv(sp.get('brands')),
    colorIds: numericCsv(sp.get('colors')),
    attributeValueIds: numericCsv(sp.get('attrs')),
    q: sp.get('q') ?? undefined,
    minPrice: sp.get('min_price') ? intParam(sp.get('min_price'), 0) : undefined,
    maxPrice: sp.get('max_price') ? intParam(sp.get('max_price'), 0) : undefined,
    inStock: sp.get('in_stock') === '1',
    hasDiscount: sp.get('has_discount') === '1',
    sort,
    page,
    perPage,
  });

  const body: Record<string, unknown> = {
    data: items,
    meta: paginationMeta(total, page, perPage),
  };

  // همراه‌سازی فیلترهای در دسترس (برند/رنگ/ویژگی/بازه قیمت) در یک ریکوئست
  if (sp.get('with_filters') === '1') {
    body.filters = buildCategoryFilters(sp.get('category') ?? undefined, sp.get('q') ?? undefined);
  }

  return NextResponse.json(body);
}
