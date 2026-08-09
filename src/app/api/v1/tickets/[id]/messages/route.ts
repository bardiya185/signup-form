import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, notFound, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { throttle } from '@/server/rate-limit';

import { requireUser } from '@/server/guards';
import { replyToTicket } from '@/server/services/ticket.service';

export const dynamic = 'force-dynamic';

export const POST = apiHandler(async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
  const user = requireUser(req);
  const { id } = await ctx.params;
  const data = validate(await req.json(), {
    body: { required: true, min: 2, max: 2000, label: 'متن پیام' },
  });
  return ok(replyToTicket(user, Number(id), data.body), { status: 201 });
});
