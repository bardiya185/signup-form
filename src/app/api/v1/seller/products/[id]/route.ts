import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, notFound, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { throttle } from '@/server/rate-limit';

import { requireUser } from '@/server/guards';
import { sellerUpdateProduct } from '@/server/services/seller.service';

export const dynamic = 'force-dynamic';

export const PUT = apiHandler(async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
  const user = requireUser(req);
  const { id } = await ctx.params;
  const data = validate(await req.json(), {
    title: { min: 5, max: 200 },
    price: { type: 'number', min: 1000 },
    sale_price: { type: 'number', min: 1000 },
    stock: { type: 'number', min: 0 },
    short_description: { max: 500 },
  });
  return ok(sellerUpdateProduct(user, Number(id), data as never));
});
