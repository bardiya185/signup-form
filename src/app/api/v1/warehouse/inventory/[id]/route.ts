import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { ok } from '@/server/http';
import { validate } from '@/server/validate';
import { requireWarehouse } from '@/server/guards';
import { adjustStock } from '@/server/services/warehouse.service';

export const dynamic = 'force-dynamic';

// PUT /api/v1/warehouse/inventory/:id — تعدیل موجودی تنوع (با لاگ گردش)
export const PUT = apiHandler(async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
  const user = requireWarehouse(req);
  const { id } = await ctx.params;
  const data = validate(await req.json(), {
    stock: { required: true, type: 'number', min: 0, label: 'موجودی' },
    reason: { max: 200, label: 'دلیل' },
  });
  return ok(adjustStock(user, Number(id), Math.round(data.stock), data.reason));
});
