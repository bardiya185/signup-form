import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { requireAdmin } from '@/server/guards';

import { adminCreateCoupon, adminListCoupons } from '@/server/services/admin-catalog.service';

export const dynamic = 'force-dynamic';

export const GET = apiHandler(async (req: NextRequest) => {
  requireAdmin(req);
  return ok(adminListCoupons());
});

export const POST = apiHandler(async (req: NextRequest) => {
  const admin = requireAdmin(req);
  const data = validate(await req.json(), {
    code: { required: true, min: 3, max: 30, label: 'کد' },
    type: { required: true, en: ['percentage', 'fixed'], label: 'نوع' },
    value: { required: true, type: 'number', min: 1, label: 'مقدار' },
    max_discount: { type: 'number', min: 1000 },
    min_order_amount: { type: 'number', min: 0 },
    usage_limit: { type: 'number', min: 1 },
    per_user_limit: { type: 'number', min: 1 },
    expires_at: { max: 40, label: 'تاریخ انقضا' },
  });
  return ok(adminCreateCoupon(admin, data as never), { status: 201 });
});
