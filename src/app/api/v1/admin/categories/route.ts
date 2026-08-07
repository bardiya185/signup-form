import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { requireAdmin } from '@/server/guards';

import { adminCreateCategory, adminListCategories } from '@/server/services/admin-catalog.service';

export const dynamic = 'force-dynamic';

export const GET = apiHandler(async (req: NextRequest) => {
  requireAdmin(req);
  return ok(adminListCategories());
});

export const POST = apiHandler(async (req: NextRequest) => {
  const admin = requireAdmin(req);
  const data = validate(await req.json(), {
    title: { required: true, min: 2, max: 80, label: 'عنوان دسته' },
    parent_id: { type: 'number', min: 1 },
    sort_order: { type: 'number', min: 0 },
  });
  return ok(adminCreateCategory(admin, data as never), { status: 201 });
});
