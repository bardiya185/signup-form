import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { requireAdmin } from '@/server/guards';

import { db } from '@/server/db';
import { notFound } from '@/server/http';
import { orderDetailDto, adminUpdateOrderStatus } from '@/server/services/order.service';
import { toPaymentDto } from '@/server/resources';

export const dynamic = 'force-dynamic';

export const GET = apiHandler(async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
  requireAdmin(req);
  const { id } = await ctx.params;
  const order = db.orders.find((o) => o.id === Number(id));
  if (!order) return notFound('سفارش یافت نشد');
  const payments = db.payments.filter((p) => p.order_id === order.id).map(toPaymentDto);
  return ok({ ...orderDetailDto(order), payments });
});

export const PUT = apiHandler(async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
  const admin = requireAdmin(req);
  const { id } = await ctx.params;
  const data = validate(await req.json(), {
    status: { required: true, en: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'], label: 'وضعیت' },
    description: { max: 300, label: 'توضیح' },
  });
  return ok(adminUpdateOrderStatus(admin, Number(id), data.status as never, data.description));
});
