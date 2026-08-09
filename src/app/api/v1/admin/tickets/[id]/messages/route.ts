import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { requireAdmin } from '@/server/guards';

import { replyToTicket } from '@/server/services/ticket.service';

export const dynamic = 'force-dynamic';

export const POST = apiHandler(async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
  const admin = requireAdmin(req);
  const { id } = await ctx.params;
  const data = validate(await req.json(), {
    body: { required: true, min: 2, max: 2000, label: 'متن پاسخ' },
  });
  return ok(replyToTicket(admin, Number(id), data.body), { status: 201 });
});
