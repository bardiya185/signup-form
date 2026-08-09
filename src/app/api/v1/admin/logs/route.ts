import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { requireAdmin } from '@/server/guards';

import { db } from '@/server/db';
import { toActivityLogDto } from '@/server/resources';

export const dynamic = 'force-dynamic';

export const GET = apiHandler(async (req: NextRequest) => {
  requireAdmin(req);
  const page = Math.max(1, intParam(req.nextUrl.searchParams.get('page'), 1));
  const perPage = Math.min(100, Math.max(1, intParam(req.nextUrl.searchParams.get('per_page'), 30)));
  const list = [...db.activity_logs].sort((a, b) => b.id - a.id);
  return paginated(list.slice((page - 1) * perPage, page * perPage).map(toActivityLogDto), list.length, page, perPage);
});
