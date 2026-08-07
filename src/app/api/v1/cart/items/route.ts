import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, notFound, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { throttle } from '@/server/rate-limit';

import { addItem } from '@/server/services/cart.service';

export const dynamic = 'force-dynamic';

export const POST = apiHandler(async (req: NextRequest) => {
  throttle(req, 'cart-write', 30, 60);
  const data = validate(await req.json(), {
    product_variant_id: { required: true, type: 'number', min: 1 },
    quantity: { required: true, type: 'number', min: 1, max: 50 },
  });
  return ok(addItem(req, data.product_variant_id, data.quantity));
});
