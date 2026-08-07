import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, notFound, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { throttle } from '@/server/rate-limit';

import { queryProducts } from '@/server/repositories/product.repository';
import type { ProductSort } from '@/types/dto';

const SORTS = ['most_relevant', 'best_selling', 'most_viewed', 'highest_rated', 'newest', 'price_asc', 'price_desc', 'highest_discount'];

export const dynamic = 'force-dynamic';

export const GET = apiHandler(async (req: NextRequest, ctx: { params: Promise<{ slug: string }> }) => {
  const { slug } = await ctx.params;
  const sp = req.nextUrl.searchParams;
  const sortRaw = sp.get('sort') ?? 'most_relevant';
  const page = Math.max(1, intParam(sp.get('page'), 1));
  const perPage = Math.min(48, Math.max(1, intParam(sp.get('per_page'), 12)));
  const csv = (raw: string | null) => (raw ? raw.split(',').map((s) => s.trim()).filter(Boolean) : []);
  const { items, total } = queryProducts({
    categorySlug: slug,
    brandSlugs: csv(sp.get('brands')),
    colorIds: csv(sp.get('colors')).map(Number).filter(Number.isFinite),
    attributeValueIds: csv(sp.get('attrs')).map(Number).filter(Number.isFinite),
    q: sp.get('q') ?? undefined,
    minPrice: sp.get('min_price') ? intParam(sp.get('min_price'), 0) : undefined,
    maxPrice: sp.get('max_price') ? intParam(sp.get('max_price'), 0) : undefined,
    inStock: sp.get('in_stock') === '1',
    hasDiscount: sp.get('has_discount') === '1',
    sort: (SORTS.includes(sortRaw) ? sortRaw : 'most_relevant') as ProductSort,
    page, perPage,
  });
  return paginated(items, total, page, perPage);
});
