import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, notFound, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { throttle } from '@/server/rate-limit';

import { requireUser } from '@/server/guards';
import { db, nextId } from '@/server/db';
import { findProductByParam } from '@/server/repositories/product.repository';
import { productReviews } from '@/server/repositories/review.repository';

export const dynamic = 'force-dynamic';

export const GET = apiHandler(async (req: NextRequest, ctx: { params: Promise<{ slug: string }> }) => {
  const { slug } = await ctx.params;
  const product = findProductByParam(slug);
  if (!product) return notFound('محصول مورد نظر یافت نشد');
  const page = Math.max(1, intParam(req.nextUrl.searchParams.get('page'), 1));
  const perPage = Math.min(20, Math.max(1, intParam(req.nextUrl.searchParams.get('per_page'), 10)));
  const { items, total } = productReviews(product.id, page, perPage);
  return paginated(items, total, page, perPage);
});

export const POST = apiHandler(async (req: NextRequest, ctx: { params: Promise<{ slug: string }> }) => {
  const user = requireUser(req);
  const { slug } = await ctx.params;
  const product = findProductByParam(slug);
  if (!product) return notFound('محصول مورد نظر یافت نشد');
  const raw = (await req.json()) as Record<string, unknown>;
  const data = validate(raw, {
    title: { min: 3, max: 120, label: 'عنوان دیدگاه' },
    body: { required: true, min: 10, max: 3000, label: 'متن دیدگاه' },
    rating: { required: true, type: 'number', min: 1, max: 5 },
  });
  const sanitizeList = (v: unknown): string[] =>
    Array.isArray(v) ? v.map(String).map((s) => s.trim()).filter(Boolean).slice(0, 10) : [];
  const variantIds = db.product_variants.filter((v) => v.product_id === product.id).map((v) => v.id);
  const boughtItem = db.order_items.find((i) => {
    const order = db.orders.find((o) => o.id === i.order_id);
    return variantIds.includes(i.product_variant_id) && order?.user_id === user.id && order.status === 'delivered';
  });
  const numericRating = Math.min(5, Math.max(1, Math.round(data.rating))) as 1 | 2 | 3 | 4 | 5;
  db.reviews.push({
    id: nextId(db.reviews), product_id: product.id, user_id: user.id,
    order_item_id: boughtItem?.id ?? null,
    title: data.title || data.body.slice(0, 40),
    body: data.body, rating: numericRating,
    pros: sanitizeList(raw.pros), cons: sanitizeList(raw.cons),
    is_buyer: !!boughtItem, status: 'pending',
    likes_count: 0, dislikes_count: 0,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  });
  return ok({ submitted: true, message: 'دیدگاه شما ثبت شد و پس از تایید نمایش داده می‌شود' }, { status: 201 });
});
