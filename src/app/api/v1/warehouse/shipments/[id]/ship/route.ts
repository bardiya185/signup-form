import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { ok } from '@/server/http';
import { requireWarehouse } from '@/server/guards';
import { shipOrder } from '@/server/services/warehouse.service';

export const dynamic = 'force-dynamic';

// PUT /api/v1/warehouse/shipments/:id/ship — خروج سفارش از انبار
export const PUT = apiHandler(async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
  const user = requireWarehouse(req);
  const { id } = await ctx.params;
  return ok(shipOrder(user, Number(id)));
});
