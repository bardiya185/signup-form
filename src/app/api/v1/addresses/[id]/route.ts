import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, notFound, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { throttle } from '@/server/rate-limit';

import { requireUser } from '@/server/guards';
import { deleteAddress, updateAddress } from '@/server/services/address.service';

export const dynamic = 'force-dynamic';

export const PUT = apiHandler(async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
  const user = requireUser(req);
  const { id } = await ctx.params;
  const data = validate(await req.json(), {
    title: { min: 2, max: 40 },
    province_id: { type: 'number', min: 1 },
    city_id: { type: 'number', min: 1 },
    full_address: { min: 10, max: 500 },
    postal_code: { min: 10, max: 10 },
    receiver_name: { min: 3, max: 80 },
    receiver_phone: { phone: true },
    is_default: { type: 'boolean' },
  });
  return ok(updateAddress(user, Number(id), data as never));
});

export const DELETE = apiHandler(async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
  const user = requireUser(req);
  const { id } = await ctx.params;
  deleteAddress(user, Number(id));
  return ok({ deleted: true, message: 'آدرس حذف شد' });
});
