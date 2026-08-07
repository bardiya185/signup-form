import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, notFound, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { throttle } from '@/server/rate-limit';

import { requireUser } from '@/server/guards';
import { sellerCreateProduct, sellerProducts } from '@/server/services/seller.service';

export const dynamic = 'force-dynamic';

export const GET = apiHandler(async (req: NextRequest) => {
  const user = requireUser(req);
  const page = Math.max(1, intParam(req.nextUrl.searchParams.get('page'), 1));
  const { items, total } = sellerProducts(user, page, 10);
  return paginated(items, total, page, 10);
});

export const POST = apiHandler(async (req: NextRequest) => {
  const user = requireUser(req);
  const data = validate(await req.json(), {
    title: { required: true, min: 5, max: 200, label: 'عنوان محصول' },
    category_id: { required: true, type: 'number', min: 1, label: 'دسته‌بندی' },
    brand_id: { type: 'number', min: 1, label: 'برند' },
    price: { required: true, type: 'number', min: 1000 },
    sale_price: { type: 'number', min: 1000 },
    stock: { required: true, type: 'number', min: 0 },
    color_id: { type: 'number', min: 1, label: 'رنگ' },
    short_description: { max: 500, label: 'توضیح کوتاه' },
    image: { max: 300, label: 'تصویر' },
  });
  return ok(sellerCreateProduct(user, data as never), { status: 201 });
});
