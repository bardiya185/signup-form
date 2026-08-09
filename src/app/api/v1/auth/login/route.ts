import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, notFound, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { throttle } from '@/server/rate-limit';

import { login } from '@/server/services/auth.service';

export const dynamic = 'force-dynamic';

export const POST = apiHandler(async (req: NextRequest) => {
  throttle(req, 'login', 6, 60);
  const data = validate(await req.json(), {
    identity: { required: true, min: 3, max: 120 },
    password: { required: true, min: 1, max: 72 },
  });
  return ok(login(data.identity, data.password));
});
