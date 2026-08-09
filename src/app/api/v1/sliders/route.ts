import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, notFound, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { throttle } from '@/server/rate-limit';

import { slidersByPosition } from '@/server/repositories/content.repository';

export function GET(req: NextRequest) {
  const position = req.nextUrl.searchParams.get('position') ?? 'home_hero';
  return ok(slidersByPosition(position));
}
