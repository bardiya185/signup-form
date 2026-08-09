import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, notFound, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { throttle } from '@/server/rate-limit';

import { blogList } from '@/server/repositories/content.repository';
import { toBlogDto } from '@/server/resources';

export function GET(req: NextRequest) {
  const page = Math.max(1, intParam(req.nextUrl.searchParams.get('page'), 1));
  const { items, total } = blogList(page, 9);
  return paginated(items.map((p) => toBlogDto(p)), total, page, 9);
}
