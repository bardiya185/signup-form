import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, notFound, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { throttle } from '@/server/rate-limit';

import { removeItem, updateItem } from '@/server/services/cart.service';

export const dynamic = 'force-dynamic';

export const PUT = apiHandler(async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;
  const data = validate(await req.json(), {
    quantity: { required: true, type: 'number', min: 0, max: 50 },
  });
  return ok(updateItem(req, Number(id), data.quantity));
});

export const DELETE = apiHandler(async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;
  return ok(removeItem(req, Number(id)));
});
