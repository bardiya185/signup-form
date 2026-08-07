import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, notFound, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { throttle } from '@/server/rate-limit';

import { sendOtp } from '@/server/services/auth.service';

export const dynamic = 'force-dynamic';

export const POST = apiHandler(async (req: NextRequest) => {
  throttle(req, 'otp-send', 3, 120);
  const data = validate(await req.json(), {
    phone: { required: true, phone: true },
  });
  return ok({ ...sendOtp(data.phone), message: 'کد تایید برای شما ارسال شد' });
});
