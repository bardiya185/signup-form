import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, notFound, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { throttle } from '@/server/rate-limit';

import { register } from '@/server/services/auth.service';

export const dynamic = 'force-dynamic';

export const POST = apiHandler(async (req: NextRequest) => {
  throttle(req, 'register', 5, 60);
  const data = validate(await req.json(), {
    first_name: { required: true, min: 2, max: 50 },
    last_name: { required: true, min: 2, max: 50 },
    phone: { required: true, phone: true },
    email: { email: true, max: 120 },
    password: { required: true, min: 6, max: 72 },
    password_confirmation: {},
  });
  return ok(register(data as never));
});
