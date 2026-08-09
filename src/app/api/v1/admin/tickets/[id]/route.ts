import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { requireAdmin } from '@/server/guards';

import { closeTicket, getTicket } from '@/server/services/ticket.service';

export const dynamic = 'force-dynamic';

export const GET = apiHandler(async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
  const admin = requireAdmin(req);
  const { id } = await ctx.params;
  return ok(getTicket(admin, Number(id)));
});

export const PUT = apiHandler(async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
  const admin = requireAdmin(req);
  const { id } = await ctx.params;
  return ok(closeTicket(admin, Number(id)));
});
