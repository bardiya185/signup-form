import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, notFound, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { throttle } from '@/server/rate-limit';

import { remember } from '@/server/cache';
import { homePayload } from '@/server/repositories/content.repository';

export function GET() {
  return ok(remember('home:payload', 120, ['home'], () => homePayload()));
}
