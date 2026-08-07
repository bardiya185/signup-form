import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { requireAdmin } from '@/server/guards';

import { adminCreateBanner, adminListBanners } from '@/server/services/admin-catalog.service';

export const dynamic = 'force-dynamic';

export const GET = apiHandler(async (req: NextRequest) => {
  requireAdmin(req);
  return ok(adminListBanners());
});

export const POST = apiHandler(async (req: NextRequest) => {
  const admin = requireAdmin(req);
  const data = validate(await req.json(), {
    title: { required: true, min: 2, max: 100, label: 'عنوان بنر' },
    image: { required: true, min: 5, max: 300, label: 'تصویر' },
    link: { max: 300 },
    position: { required: true, en: ['hero', 'sidebar', 'category', 'product'], label: 'موقعیت' },
    sort_order: { type: 'number', min: 0 },
  });
  return ok(adminCreateBanner(admin, data as never), { status: 201 });
});
