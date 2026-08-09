import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { intParam, notFound, ok, paginated } from '@/server/http';
import { validate } from '@/server/validate';
import { throttle } from '@/server/rate-limit';

import { clearCart } from '@/server/services/cart.service';

export const dynamic = 'force-dynamic';

export const DELETE = apiHandler(async (req: NextRequest) => ok(clearCart(req)));
