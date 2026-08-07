import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, notFound, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { throttle } from '@/server/rate-limit';

import { requireUser } from '@/server/guards';
import { changePassword } from '@/server/services/auth.service';

export const dynamic = 'force-dynamic';

export const PUT = apiHandler(async (req: NextRequest) => {
  const user = requireUser(req);
  const data = validate(await req.json(), {
    current_password: { required: true, max: 72 },
    password: { required: true, min: 6, max: 72 },
    password_confirmation: {},
  });
  changePassword(user, data.current_password, data.password);
  return ok({ changed: true, message: 'رمز عبور با موفقیت تغییر کرد' });
});
