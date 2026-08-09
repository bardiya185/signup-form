import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, paginated } from '@/server/http';
import { requireWarehouse } from '@/server/guards';
import { shipmentsList } from '@/server/services/warehouse.service';

export const dynamic = 'force-dynamic';

// GET /api/v1/warehouse/shipments?state=ready|shipped — صف ارسال / ارسال‌شده‌ها
export const GET = apiHandler(async (req: NextRequest) => {
  requireWarehouse(req);
  const sp = req.nextUrl.searchParams;
  const state = sp.get('state') === 'shipped' ? 'shipped' : 'ready';
  const page = Math.max(1, intParam(sp.get('page'), 1));
  const { items, total } = shipmentsList(state, page, 10);
  return paginated(items, total, page, 10);
});
