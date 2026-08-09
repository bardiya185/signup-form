import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, notFound, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { throttle } from '@/server/rate-limit';

import { db } from '@/server/db';
import { findProductByParam } from '@/server/repositories/product.repository';

export const dynamic = 'force-dynamic';

export const GET = apiHandler(async (_req: NextRequest, ctx: { params: Promise<{ slug: string }> }) => {
  const { slug } = await ctx.params;
  const product = findProductByParam(slug);
  if (!product) return notFound('محصول مورد نظر یافت نشد');
  const rows = db.product_variants
    .filter((v) => v.product_id === product.id && v.is_active)
    .map((v) => ({
      variantId: v.id,
      sku: v.sku,
      currentPrice: v.sale_price ?? v.price,
      points: db.product_price_history
        .filter((h) => h.product_variant_id === v.id)
        .sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at))
        .map((h) => ({ date: h.created_at, price: h.new_price })),
    }));
  return ok(rows);
});
