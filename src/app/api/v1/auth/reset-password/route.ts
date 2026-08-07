import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, notFound, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { throttle } from '@/server/rate-limit';

import { resetPassword } from '@/server/services/auth.service';

export const dynamic = 'force-dynamic';

export const POST = apiHandler(async (req: NextRequest) => {
  throttle(req, 'reset', 6, 120);
  const data = validate(await req.json(), {
    identity: { required: true, min: 3, max: 120 },
    code: { required: true, min: 4, max: 6 },
    password: { required: true, min: 6, max: 72 },
    password_confirmation: {},
  });
  resetPassword(data.identity, data.code, data.password);
  return ok({ reset: true, message: 'رمز عبور با موفقیت تغییر کرد' });
});
