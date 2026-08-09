import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { requireAdmin } from '@/server/guards';

import { adminDeleteReview, adminModerateReview } from '@/server/services/admin-catalog.service';

export const dynamic = 'force-dynamic';

export const PUT = apiHandler(async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
  const admin = requireAdmin(req);
  const { id } = await ctx.params;
  const data = validate(await req.json(), {
    status: { required: true, en: ['approved', 'rejected'], label: 'وضعیت' },
  });
  return ok(adminModerateReview(admin, Number(id), data.status as never));
});

export const DELETE = apiHandler(async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
  const admin = requireAdmin(req);
  const { id } = await ctx.params;
  adminDeleteReview(admin, Number(id));
  return ok({ deleted: true, message: 'دیدگاه حذف شد' });
});
