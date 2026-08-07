import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, notFound, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { throttle } from '@/server/rate-limit';

import { requireUser } from '@/server/guards';
import { createWalletDeposit } from '@/server/services/payment.service';

export const dynamic = 'force-dynamic';

export const POST = apiHandler(async (req: NextRequest) => {
  const user = requireUser(req);
  const data = validate(await req.json(), {
    amount: { required: true, type: 'number', min: 10000 },
    gateway: { required: true, en: ['zarinpal', 'mellat', 'saman'], label: 'درگاه پرداخت' },
  });
  return ok(createWalletDeposit(user, data.amount, data.gateway as 'zarinpal', new URL(req.url).origin));
});
