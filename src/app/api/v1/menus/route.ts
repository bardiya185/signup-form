import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, notFound, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { throttle } from '@/server/rate-limit';

import { menusByLocation } from '@/server/repositories/content.repository';

export function GET(req: NextRequest) {
  const location = req.nextUrl.searchParams.get('location') ?? 'footer_col1';
  return ok(menusByLocation(location));
}
