import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { requireAdmin } from '@/server/guards';

import { adminCreateOffer, adminListOffers } from '@/server/services/admin-catalog.service';

export const dynamic = 'force-dynamic';

export const GET = apiHandler(async (req: NextRequest) => {
  requireAdmin(req);
  return ok(adminListOffers());
});

export const POST = apiHandler(async (req: NextRequest) => {
  const admin = requireAdmin(req);
  const data = validate(await req.json(), {
    product_variant_id: { required: true, type: 'number', min: 1, label: 'تنوع محصول' },
    discount_price: { required: true, type: 'number', min: 100, label: 'قیمت پیشنهادی' },
    stock: { required: true, type: 'number', min: 1 },
    starts_at: { required: true, min: 10, max: 40, label: 'تاریخ شروع' },
    expires_at: { required: true, min: 10, max: 40, label: 'تاریخ پایان' },
    type: { en: ['incredible_offers', 'daily_deals'], label: 'نوع' },
  });
  return ok(adminCreateOffer(admin, data as never), { status: 201 });
});
