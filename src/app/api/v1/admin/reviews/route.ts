import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { requireAdmin } from '@/server/guards';

import { adminListReviews } from '@/server/services/admin-catalog.service';

export const dynamic = 'force-dynamic';

export const GET = apiHandler(async (req: NextRequest) => {
  requireAdmin(req);
  const page = Math.max(1, intParam(req.nextUrl.searchParams.get('page'), 1));
  const perPage = Math.min(50, Math.max(1, intParam(req.nextUrl.searchParams.get('per_page'), 15)));
  const { items, total } = adminListReviews({ status: req.nextUrl.searchParams.get('status') ?? undefined, page, perPage });
  return paginated(items, total, page, perPage);
});
