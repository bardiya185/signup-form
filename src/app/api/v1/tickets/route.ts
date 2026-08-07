import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, notFound, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { throttle } from '@/server/rate-limit';

import { requireUser } from '@/server/guards';
import { createTicket, listUserTickets } from '@/server/services/ticket.service';

export const dynamic = 'force-dynamic';

export const GET = apiHandler(async (req: NextRequest) => {
  const user = requireUser(req);
  const status = req.nextUrl.searchParams.get('status') ?? undefined;
  const page = Math.max(1, intParam(req.nextUrl.searchParams.get('page'), 1));
  const { items, total } = listUserTickets(user, status as never, page, 10);
  return paginated(items, total, page, 10);
});

export const POST = apiHandler(async (req: NextRequest) => {
  const user = requireUser(req);
  const data = validate(await req.json(), {
    department: { required: true, en: ['orders', 'payments', 'returns', 'technical', 'general'], label: 'دپارتمان' },
    subject: { required: true, min: 4, max: 150, label: 'موضوع' },
    priority: { required: true, en: ['low', 'medium', 'high', 'urgent'], label: 'اولویت' },
    order_id: { type: 'number', min: 1, label: 'سفارش' },
    message: { required: true, min: 5, max: 2000, label: 'متن پیام' },
  });
  return ok(createTicket(user, data as never), { status: 201 });
});
