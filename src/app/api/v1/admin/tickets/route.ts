import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { requireAdmin } from '@/server/guards';

import { adminListTickets } from '@/server/services/ticket.service';

export const dynamic = 'force-dynamic';

export const GET = apiHandler(async (req: NextRequest) => {
  requireAdmin(req);
  const page = Math.max(1, intParam(req.nextUrl.searchParams.get('page'), 1));
  const { items, total } = adminListTickets({
    status: req.nextUrl.searchParams.get('status') ?? undefined,
    department: req.nextUrl.searchParams.get('department') ?? undefined,
    page, perPage: 15,
  });
  return paginated(items, total, page, 15);
});
