import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { requireAdmin } from '@/server/guards';

import { salesReport } from '@/server/services/admin.service';

export const dynamic = 'force-dynamic';

export const GET = apiHandler(async (req: NextRequest) => {
  requireAdmin(req);
  const days = Math.min(60, Math.max(7, intParam(req.nextUrl.searchParams.get('days'), 14)));
  return ok(salesReport(days));
});
