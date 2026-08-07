import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, notFound, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { throttle } from '@/server/rate-limit';

import { buildCategoryFilters } from '@/server/repositories/product.repository';

export const dynamic = 'force-dynamic';

export const GET = apiHandler(async (_req: NextRequest, ctx: { params: Promise<{ slug: string }> }) => {
  const { slug } = await ctx.params;
  return ok(buildCategoryFilters(slug).brands);
});
