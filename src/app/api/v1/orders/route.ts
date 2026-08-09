import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, notFound, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { throttle } from '@/server/rate-limit';

import { requireUser } from '@/server/guards';
import { listUserOrders } from '@/server/services/order.service';

export const dynamic = 'force-dynamic';

export const GET = apiHandler(async (req: NextRequest) => {
  const user = requireUser(req);
  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, intParam(sp.get('page'), 1));
  const perPage = Math.min(20, Math.max(1, intParam(sp.get('per_page'), 10)));
  const valid = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'] as const;
  const status = valid.includes(sp.get('status') as never) ? (sp.get('status') as (typeof valid)[number]) : undefined;
  const { items, total } = listUserOrders(user, page, perPage, status);
  return paginated(items, total, page, perPage);
});
