import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { requireAdmin } from '@/server/guards';

import { adminCreateProduct, adminListProducts } from '@/server/services/admin-catalog.service';

export const dynamic = 'force-dynamic';

export const GET = apiHandler(async (req: NextRequest) => {
  requireAdmin(req);
  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, intParam(sp.get('page'), 1));
  const perPage = Math.min(50, Math.max(1, intParam(sp.get('per_page'), 15)));
  const { items, total } = adminListProducts({
    q: sp.get('q') ?? undefined,
    status: sp.get('status') ?? undefined,
    category: sp.get('category') ?? undefined,
    page, perPage,
  });
  return paginated(items, total, page, perPage);
});

export const POST = apiHandler(async (req: NextRequest) => {
  const admin = requireAdmin(req);
  const data = validate(await req.json(), {
    title: { required: true, min: 5, max: 200, label: 'عنوان محصول' },
    category_id: { required: true, type: 'number', min: 1, label: 'دسته‌بندی' },
    brand_id: { type: 'number', min: 1 },
    seller_id: { type: 'number', min: 1 },
    price: { required: true, type: 'number', min: 1000 },
    sale_price: { type: 'number', min: 1000 },
    stock: { required: true, type: 'number', min: 0 },
    short_description: { max: 500 },
  });
  return ok(adminCreateProduct(admin, data as never), { status: 201 });
});
