import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, notFound, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { throttle } from '@/server/rate-limit';

import { requireUser } from '@/server/guards';
import { createOrderPayment } from '@/server/services/payment.service';

export const dynamic = 'force-dynamic';

export const POST = apiHandler(async (req: NextRequest) => {
  const user = requireUser(req);
  const data = validate(await req.json(), {
    order_number: { required: true, min: 4, max: 30, label: 'شماره سفارش' },
    gateway: { required: true, en: ['zarinpal', 'mellat', 'saman'], label: 'درگاه پرداخت' },
  });
  const origin = new URL(req.url).origin;
  return ok(createOrderPayment(user, data.order_number, data.gateway as 'zarinpal' | 'mellat' | 'saman', origin));
});
