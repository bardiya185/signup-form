import { notFound, ok } from '@/server/http';
import {
  categoryBreadcrumb, categoryNode, findCategoryBySlug,
} from '@/server/repositories/catalog.repository';
import { buildCategoryFilters } from '@/server/repositories/product.repository';

export const dynamic = 'force-dynamic';

// GET /api/v1/categories/:slug — دسته + فیلترهای موجود (برند/رنگ/ویژگی/بازه قیمت)
export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const category = findCategoryBySlug(slug);
  if (!category) return notFound('دسته‌بندی مورد نظر یافت نشد');

  return ok({
    category: categoryNode(category),
    breadcrumb: categoryBreadcrumb(category),
    filters: buildCategoryFilters(slug),
  });
}
