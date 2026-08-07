import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, notFound, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { throttle } from '@/server/rate-limit';

import { forgotPassword } from '@/server/services/auth.service';

export const dynamic = 'force-dynamic';

export const POST = apiHandler(async (req: NextRequest) => {
  throttle(req, 'forgot', 3, 120);
  const data = validate(await req.json(), {
    identity: { required: true, min: 3, max: 120 },
  });
  return ok({ ...forgotPassword(data.identity), message: 'کد بازیابی برای شما ارسال شد' });
});
