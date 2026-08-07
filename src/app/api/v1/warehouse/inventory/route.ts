import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, ok, paginated } from '@/server/http';
import { requireWarehouse } from '@/server/guards';
import { inventoryList } from '@/server/services/warehouse.service';

export const dynamic = 'force-dynamic';

// GET /api/v1/warehouse/inventory?state=low_stock|out_of_stock|in_stock|all&q=
export const GET = apiHandler(async (req: NextRequest) => {
  requireWarehouse(req);
  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, intParam(sp.get('page'), 1));
  const perPage = Math.min(50, Math.max(1, intParam(sp.get('per_page'), 15)));
  const { items, total } = inventoryList({
    q: sp.get('q') ?? undefined,
    state: sp.get('state') ?? undefined,
    page, perPage,
  });
  return paginated(items, total, page, perPage);
});
