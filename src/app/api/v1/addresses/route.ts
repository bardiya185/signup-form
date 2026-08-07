import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, notFound, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { throttle } from '@/server/rate-limit';

import { requireUser } from '@/server/guards';
import { createAddress, listAddresses } from '@/server/services/address.service';

const RULES = {
  title: { required: true, min: 2, max: 40, label: 'عنوان آدرس' },
  province_id: { required: true, type: 'number' as const, min: 1, label: 'استان' },
  city_id: { required: true, type: 'number' as const, min: 1, label: 'شهر' },
  full_address: { required: true, min: 10, max: 500, label: 'آدرس کامل' },
  postal_code: { required: true, min: 10, max: 10, label: 'کد پستی' },
  receiver_name: { required: true, min: 3, max: 80 },
  receiver_phone: { required: true, phone: true as const },
  is_default: { type: 'boolean' as const },
} as const;

export const dynamic = 'force-dynamic';

export const GET = apiHandler(async (req: NextRequest) => {
  const user = requireUser(req);
  return ok(listAddresses(user));
});

export const POST = apiHandler(async (req: NextRequest) => {
  const user = requireUser(req);
  const data = validate(await req.json(), RULES);
  return ok(createAddress(user, data as never), { status: 201 });
});
