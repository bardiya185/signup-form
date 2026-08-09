import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, notFound, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { throttle } from '@/server/rate-limit';

import { requireUser } from '@/server/guards';
import { updateProfile } from '@/server/services/auth.service';

export const dynamic = 'force-dynamic';

export const PUT = apiHandler(async (req: NextRequest) => {
  const user = requireUser(req);
  const data = validate(await req.json(), {
    first_name: { min: 2, max: 50 },
    last_name: { min: 2, max: 50 },
    email: { email: true, max: 120 },
    national_code: { min: 10, max: 10 },
    birth_date: { max: 20 },
    gender: { en: ['male', 'female'] },
  });
  return ok(updateProfile(user, data as never));
});
