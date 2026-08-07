import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, notFound, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { throttle } from '@/server/rate-limit';

import { verifyPayment } from '@/server/services/payment.service';

export const dynamic = 'force-dynamic';

export const GET = apiHandler(async (req: NextRequest, _ctx: { params: Promise<{ gateway: string }> }) => {
  const sp = req.nextUrl.searchParams;
  const authority = sp.get('Authority') ?? '';
  const status = sp.get('Status') ?? 'NOK';
  if (!authority) return notFound('شناسه تراکنش ارسال نشده است');
  return ok(verifyPayment(authority, status));
});
