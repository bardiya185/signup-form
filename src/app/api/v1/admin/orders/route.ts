import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { requireAdmin } from '@/server/guards';

import { adminListOrders } from '@/server/services/order.service';

export const dynamic = 'force-dynamic';

export const GET = apiHandler(async (req: NextRequest) => {
  requireAdmin(req);
  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, intParam(sp.get('page'), 1));
  const perPage = Math.min(50, Math.max(1, intParam(sp.get('per_page'), 15)));
  const valid = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'] as const;
  const status = valid.includes(sp.get('status') as never) ? (sp.get('status') as (typeof valid)[number]) : undefined;
  const { items, total } = adminListOrders({ status, q: sp.get('q') ?? undefined, page, perPage });
  return paginated(items, total, page, perPage);
});
