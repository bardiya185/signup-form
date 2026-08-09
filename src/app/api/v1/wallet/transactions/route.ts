import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, notFound, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { throttle } from '@/server/rate-limit';

import { requireUser } from '@/server/guards';
import { walletTransactions } from '@/server/services/wallet.service';

export const dynamic = 'force-dynamic';

export const GET = apiHandler(async (req: NextRequest) => {
  const user = requireUser(req);
  const page = Math.max(1, intParam(req.nextUrl.searchParams.get('page'), 1));
  const { items, total } = walletTransactions(user, page, 15);
  return paginated(items, total, page, 15);
});
