import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, notFound, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { throttle } from '@/server/rate-limit';

import { requireUser } from '@/server/guards';
import { checkout } from '@/server/services/order.service';

export const dynamic = 'force-dynamic';

export const POST = apiHandler(async (req: NextRequest) => {
  const user = requireUser(req);
  const data = validate(await req.json(), {
    address_id: { required: true, type: 'number', min: 1 },
    payment_method: { required: true, en: ['zarinpal', 'mellat', 'saman', 'wallet'], label: 'روش پرداخت' },
    shipping_method_id: { type: 'number', min: 1 },
    notes: { max: 500, label: 'یادداشت' },
  });
  const result = checkout(user, data as never);
  return ok(result, { status: 201 });
});
