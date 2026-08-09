import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, notFound, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { throttle } from '@/server/rate-limit';

import { blogPostBySlug, relatedBlogPosts } from '@/server/repositories/content.repository';
import { toBlogDto } from '@/server/resources';

export async function GET(_req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const post = blogPostBySlug(slug);
  if (!post) return notFound('مطلب مورد نظر یافت نشد');
  return ok({ post: toBlogDto(post, true), related: relatedBlogPosts(post).map((p) => toBlogDto(p)) });
}
