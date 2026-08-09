import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, notFound, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { throttle } from '@/server/rate-limit';

import { addToCompare, removeFromCompare } from '@/server/services/library.service';

export const dynamic = 'force-dynamic';

export const POST = apiHandler(async (req: NextRequest, ctx: { params: Promise<{ productId: string }> }) => {
  const { productId } = await ctx.params;
  return ok(addToCompare(req, Number(productId)), { status: 201 });
});

export const DELETE = apiHandler(async (req: NextRequest, ctx: { params: Promise<{ productId: string }> }) => {
  const { productId } = await ctx.params;
  return ok(removeFromCompare(req, Number(productId)));
});
