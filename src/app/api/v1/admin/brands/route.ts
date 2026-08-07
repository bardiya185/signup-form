import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { requireAdmin } from '@/server/guards';

import { adminCreateBrand, adminListBrands } from '@/server/services/admin-catalog.service';

export const dynamic = 'force-dynamic';

export const GET = apiHandler(async (req: NextRequest) => {
  requireAdmin(req);
  return ok(adminListBrands());
});

export const POST = apiHandler(async (req: NextRequest) => {
  const admin = requireAdmin(req);
  const data = validate(await req.json(), {
    title: { required: true, min: 2, max: 60, label: 'نام برند' },
  });
  return ok(adminCreateBrand(admin, data), { status: 201 });
});
