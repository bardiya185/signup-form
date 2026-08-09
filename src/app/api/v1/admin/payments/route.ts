import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { requireAdmin } from '@/server/guards';

import { adminListPayments } from '@/server/services/payment.service';

export const dynamic = 'force-dynamic';

export const GET = apiHandler(async (req: NextRequest) => {
  requireAdmin(req);
  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, intParam(sp.get('page'), 1));
  const perPage = Math.min(50, Math.max(1, intParam(sp.get('per_page'), 15)));
  const { items, total } = adminListPayments({
    status: sp.get('status') ?? undefined,
    method: sp.get('method') ?? undefined,
    page, perPage,
  });
  return paginated(items, total, page, perPage);
});
