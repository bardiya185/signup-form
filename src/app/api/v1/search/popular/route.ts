import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, notFound, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { throttle } from '@/server/rate-limit';

import { remember } from '@/server/cache';
import { popularSearches } from '@/server/services/search.service';

export const dynamic = 'force-dynamic';

export const GET = apiHandler(async () =>
  ok(remember('search:popular', 600, ['search'], () => popularSearches())));
