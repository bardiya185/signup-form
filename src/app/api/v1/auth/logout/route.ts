import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, notFound, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { throttle } from '@/server/rate-limit';

import { logout } from '@/server/services/auth.service';

export const dynamic = 'force-dynamic';

export const POST = apiHandler(async (req: NextRequest) => {
  const header = req.headers.get('authorization');
  logout(header?.startsWith('Bearer ') ? header.slice(7).trim() : null);
  return ok({ loggedOut: true, message: 'از حساب کاربری خارج شدید' });
});
