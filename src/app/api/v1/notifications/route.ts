import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, notFound, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { throttle } from '@/server/rate-limit';

import { requireUser } from '@/server/guards';
import { listNotifications } from '@/server/services/notification.service';

export const dynamic = 'force-dynamic';

export const GET = apiHandler(async (req: NextRequest) => {
  const user = requireUser(req);
  const page = Math.max(1, intParam(req.nextUrl.searchParams.get('page'), 1));
  const perPage = Math.min(30, Math.max(1, intParam(req.nextUrl.searchParams.get('per_page'), 15)));
  const onlyUnread = req.nextUrl.searchParams.get('unread') === '1';
  const { items, total, unreadCount } = listNotifications(user, page, perPage, onlyUnread);
  const res = paginated(items, total, page, perPage);
  res.headers.set('x-unread-count', String(unreadCount));
  return res;
});
