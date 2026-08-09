import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, notFound, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { throttle } from '@/server/rate-limit';

import { currentUser } from '@/server/guards';
import { err422 } from '@/server/errors';
import { db, nextId } from '@/server/db';
import { findProductByParam } from '@/server/repositories/product.repository';

export const dynamic = 'force-dynamic';

export const POST = apiHandler(async (req: NextRequest, ctx: { params: Promise<{ slug: string }> }) => {
  const { slug } = await ctx.params;
  const product = findProductByParam(slug);
  if (!product) return notFound('محصول مورد نظر یافت نشد');
  const raw = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const user = currentUser(req);
  const phone = typeof raw.phone === 'string' && raw.phone.trim() ? raw.phone.trim() : null;
  if (!user && !phone) throw err422({ identity: ['برای اطلاع از موجودی، وارد شوید یا شماره موبایل وارد کنید'] });
  const variantId = typeof raw.variant_id === 'number' ? raw.variant_id : null;
  const variants = db.product_variants.filter((v) => v.product_id === product.id && v.is_active);
  const variant = variantId ? variants.find((v) => v.id === variantId) : variants.find((v) => v.stock === 0) ?? variants[0];
  if (!variant) throw err422({ variant: ['تنوع معتبر نیست'] });
  if (variant.stock > 0) throw err422({ variant: ['این کالا هم‌اکنون موجود است'] });
  const duplicate = db.stock_alerts.some((a) =>
    a.product_variant_id === variant.id && (user ? a.user_id === user.id : a.phone === phone));
  if (duplicate) return ok({ subscribed: true, already: true, message: 'قبلاً برای این کالا ثبت‌نام کرده‌اید' });
  db.stock_alerts.push({
    id: nextId(db.stock_alerts), user_id: user?.id ?? null, phone,
    product_variant_id: variant.id, created_at: new Date().toISOString(),
  });
  return ok({ subscribed: true, message: 'به محض موجود شدن به شما اطلاع‌رسانی می‌کنیم' }, { status: 201 });
});
