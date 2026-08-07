import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, notFound, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { throttle } from '@/server/rate-limit';

import { fullSearch } from '@/server/services/search.service';
import type { ProductSort } from '@/types/dto';

const SORTS = ['most_relevant', 'best_selling', 'most_viewed', 'highest_rated', 'newest', 'price_asc', 'price_desc', 'highest_discount'];

export const dynamic = 'force-dynamic';

export const GET = apiHandler(async (req: NextRequest) => {
  const sp = req.nextUrl.searchParams;
  const q = (sp.get('q') ?? '').trim();
  if (q.length < 2) return notFound('حداقل ۲ حرف برای جستجو وارد کنید');
  const sortRaw = sp.get('sort') ?? 'most_relevant';
  const sort = (SORTS.includes(sortRaw) ? sortRaw : 'most_relevant') as ProductSort;
  const page = Math.max(1, intParam(sp.get('page'), 1));
  const perPage = Math.min(48, Math.max(1, intParam(sp.get('per_page'), 12)));
  const { items, total } = fullSearch({ q, sort, page, perPage });
  return paginated(items, total, page, perPage);
});
