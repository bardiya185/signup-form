import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, paginated } from '@/server/http';
import { requireWarehouse } from '@/server/guards';
import { movementLog } from '@/server/services/warehouse.service';

export const dynamic = 'force-dynamic';

// GET /api/v1/warehouse/movements — گزارش گردش موجودی (ورود/خروج)
export const GET = apiHandler(async (req: NextRequest) => {
  requireWarehouse(req);
  const page = Math.max(1, intParam(req.nextUrl.searchParams.get('page'), 1));
  const { items, total } = movementLog(page, 20);
  return paginated(items, total, page, 20);
});
