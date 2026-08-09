import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, notFound, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { throttle } from '@/server/rate-limit';

import { requireUser } from '@/server/guards';
import { db, nextId } from '@/server/db';
import { findProductByParam } from '@/server/repositories/product.repository';
import { productQuestions } from '@/server/repositories/review.repository';

export const dynamic = 'force-dynamic';

export const GET = apiHandler(async (_req: NextRequest, ctx: { params: Promise<{ slug: string }> }) => {
  const { slug } = await ctx.params;
  const product = findProductByParam(slug);
  if (!product) return notFound('محصول مورد نظر یافت نشد');
  return ok(productQuestions(product.id));
});

export const POST = apiHandler(async (req: NextRequest, ctx: { params: Promise<{ slug: string }> }) => {
  const user = requireUser(req);
  const { slug } = await ctx.params;
  const product = findProductByParam(slug);
  if (!product) return notFound('محصول مورد نظر یافت نشد');
  const data = validate(await req.json(), {
    question: { required: true, min: 5, max: 500, label: 'پرسش' },
  });
  db.product_questions.push({
    id: nextId(db.product_questions), product_id: product.id, user_id: user.id,
    question: data.question, answer: null, answered_by: null, answered_at: null,
    status: 'pending', created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  });
  return ok({ submitted: true, message: 'پرسش شما ثبت شد و پس از پاسخ نمایش داده می‌شود' }, { status: 201 });
});
