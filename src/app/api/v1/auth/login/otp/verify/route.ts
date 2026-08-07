import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, notFound, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { throttle } from '@/server/rate-limit';

import { verifyOtp } from '@/server/services/auth.service';

export const dynamic = 'force-dynamic';

export const POST = apiHandler(async (req: NextRequest) => {
  throttle(req, 'otp-verify', 6, 120);
  const data = validate(await req.json(), {
    phone: { required: true, phone: true },
    code: { required: true, min: 4, max: 6 },
  });
  return ok(verifyOtp(data.phone, data.code));
});
