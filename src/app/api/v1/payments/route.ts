import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, notFound, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { throttle } from '@/server/rate-limit';

import { requireUser } from '@/server/guards';
import { listUserPayments } from '@/server/services/payment.service';

export const dynamic = 'force-dynamic';

export const GET = apiHandler(async (req: NextRequest) => {
  const user = requireUser(req);
  const page = Math.max(1, intParam(req.nextUrl.searchParams.get('page'), 1));
  const perPage = Math.min(20, Math.max(1, intParam(req.nextUrl.searchParams.get('per_page'), 10)));
  const { items, total } = listUserPayments(user, page, perPage);
  return paginated(items, total, page, perPage);
});
