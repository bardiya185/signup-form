import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, notFound, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { throttle } from '@/server/rate-limit';

import { requireUser } from '@/server/guards';
import { cancelOrder } from '@/server/services/order.service';

export const dynamic = 'force-dynamic';

export const POST = apiHandler(async (req: NextRequest, ctx: { params: Promise<{ orderNumber: string }> }) => {
  const user = requireUser(req);
  const { orderNumber } = await ctx.params;
  const data = validate(await req.json(), {
    reason: { required: true, min: 3, max: 300, label: 'دلیل لغو' },
  });
  return ok(cancelOrder(user, orderNumber, data.reason));
});
