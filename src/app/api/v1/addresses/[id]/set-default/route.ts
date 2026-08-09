import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, notFound, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { throttle } from '@/server/rate-limit';

import { requireUser } from '@/server/guards';
import { setDefaultAddress } from '@/server/services/address.service';

export const dynamic = 'force-dynamic';

export const PUT = apiHandler(async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
  const user = requireUser(req);
  const { id } = await ctx.params;
  return ok(setDefaultAddress(user, Number(id)));
});
