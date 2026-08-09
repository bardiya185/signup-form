import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, notFound, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { throttle } from '@/server/rate-limit';

import { applyCoupon } from '@/server/services/cart.service';

export const dynamic = 'force-dynamic';

export const POST = apiHandler(async (req: NextRequest) => {
  const data = validate(await req.json(), {
    code: { required: true, min: 3, max: 40, label: 'کد تخفیف' },
  });
  return ok(applyCoupon(req, data.code));
});
