import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, notFound, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { throttle } from '@/server/rate-limit';

import { requireUser } from '@/server/guards';
import { findUserOrder, orderDetailDto } from '@/server/services/order.service';

export const dynamic = 'force-dynamic';

export const GET = apiHandler(async (req: NextRequest, ctx: { params: Promise<{ orderNumber: string }> }) => {
  const user = requireUser(req);
  const { orderNumber } = await ctx.params;
  const order = findUserOrder(user, orderNumber);
  return ok(orderDetailDto(order));
});
