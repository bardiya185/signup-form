import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, notFound, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { throttle } from '@/server/rate-limit';

import { requireUser } from '@/server/guards';
import { registerSeller } from '@/server/services/seller.service';

export const dynamic = 'force-dynamic';

export const POST = apiHandler(async (req: NextRequest) => {
  const user = requireUser(req);
  const data = validate(await req.json(), {
    shop_name: { required: true, min: 2, max: 60 },
    national_id: { required: true, min: 10, max: 12, label: 'شناسه ملی' },
    phone: { required: true, min: 8, max: 12, label: 'تلفن فروشگاه' },
    email: { required: true, email: true },
    province_id: { required: true, type: 'number', min: 1 },
    city_id: { required: true, type: 'number', min: 1 },
    address: { required: true, min: 10, max: 500, label: 'آدرس فروشگاه' },
    shaba_number: { required: true, min: 24, max: 34, label: 'شماره شبا' },
  });
  return ok(registerSeller(user, data as never), { status: 201 });
});
