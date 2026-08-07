import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, notFound, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { throttle } from '@/server/rate-limit';

import { requireUser } from '@/server/guards';
import { toUserDto } from '@/server/resources';
import { db } from '@/server/db';
import { findCartForUser, cartItemsOf } from '@/server/services/cart.service';
import { unreadNotificationsCount } from '@/server/services/notification.service';

export const dynamic = 'force-dynamic';

export const GET = apiHandler(async (req: NextRequest) => {
  const user = requireUser(req);
  const wallet = db.wallets.find((w) => w.user_id === user.id);
  const cart = findCartForUser(user.id);
  const cartItems = cart ? cartItemsOf(cart.id).reduce((s, i) => s + i.quantity, 0) : 0;
  return ok({
    user: toUserDto(user),
    walletBalance: wallet?.balance ?? 0,
    unreadNotifications: unreadNotificationsCount(user),
    wishlistCount: db.wishlists.filter((w) => w.user_id === user.id).length,
    cartItemsCount: cartItems,
  });
});
