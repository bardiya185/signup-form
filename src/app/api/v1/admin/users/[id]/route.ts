import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { requireAdmin } from '@/server/guards';

import { updateUserStatus } from '@/server/services/admin.service';

export const dynamic = 'force-dynamic';

export const PUT = apiHandler(async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
  const admin = requireAdmin(req);
  const { id } = await ctx.params;
  const data = validate(await req.json(), {
    status: { required: true, en: ['active', 'banned', 'inactive'], label: 'وضعیت' },
  });
  return ok(updateUserStatus(admin, Number(id), data.status as never));
});
