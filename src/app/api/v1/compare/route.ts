import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, notFound, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { throttle } from '@/server/rate-limit';

import { getCompare } from '@/server/services/library.service';

export const dynamic = 'force-dynamic';

export const GET = apiHandler(async (req: NextRequest) => ok(getCompare(req)));
