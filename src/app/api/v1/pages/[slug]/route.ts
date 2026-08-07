import { notFound, ok } from '@/server/http';
import { pageBySlug } from '@/server/repositories/content.repository';

// GET /api/v1/pages/:slug — صفحات CMS
export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const page = pageBySlug(slug);
  if (!page) return notFound('صفحه مورد نظر یافت نشد');
  return ok({ title: page.title, slug: page.slug, body: page.body });
}
