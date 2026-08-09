import { notFound, ok } from '@/server/http';
import { findProductBySlug, productDetailBySlug, relatedProducts } from '@/server/repositories/product.repository';
import { productQuestions } from '@/server/repositories/review.repository';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/v1/products/:slug — جزییات محصول + مرتبط‌ها + پرسش‌ها
export function GET(_req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  return ctx.params.then(({ slug }) => {
    const product = findProductBySlug(slug);
    if (!product) return notFound('محصول مورد نظر یافت نشد');
    return ok({
      product: productDetailBySlug(slug),
      related: relatedProducts(product),
      questions: productQuestions(product.id),
    });
  });
}
