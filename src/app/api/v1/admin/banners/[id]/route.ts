import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { requireAdmin } from '@/server/guards';

import { adminDeleteBanner, adminUpdateBanner } from '@/server/services/admin-catalog.service';

export const dynamic = 'force-dynamic';

export const PUT = apiHandler(async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
  const admin = requireAdmin(req);
  const { id } = await ctx.params;
  const body = (await req.json()) as Record<string, unknown>;
  return ok(adminUpdateBanner(admin, Number(id), body as never));
});

export const DELETE = apiHandler(async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
  const admin = requireAdmin(req);
  const { id } = await ctx.params;
  adminDeleteBanner(admin, Number(id));
  return ok({ deleted: true, message: 'بنر حذف شد' });
});
