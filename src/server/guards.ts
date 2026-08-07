import { db } from './db';
import { err401, err403 } from './errors';
import type { NextRequest } from 'next/server';
import type * as D from '@/types/domain';

/** کاربر جاری از روی Bearer Token — معادل middleware acc:sanctum */
export function currentUser(req: NextRequest | Request): D.User | null {
  const header = req.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) return null;
  const raw = header.slice(7).trim();

  const token = db.personal_access_tokens.find(
    (t) => t.token === raw && !t.revoked_at && new Date(t.expires_at) > new Date(),
  );
  if (!token) return null;
  token.last_used_at = new Date().toISOString();

  const user = db.users.find(
    (u) => u.id === token.user_id && u.status === 'active' && !u.deleted_at,
  );
  return user ?? null;
}

export function requireUser(req: NextRequest | Request): D.User {
  const user = currentUser(req);
  if (!user) throw err401();
  return user;
}

/** معادل middleware role + Policies */
export function requireRole(req: NextRequest | Request, roles: D.UserRole[]): D.User {
  const user = requireUser(req);
  if (!roles.includes(user.role)) throw err403();
  return user;
}

export const requireAdmin = (req: NextRequest | Request): D.User =>
  requireRole(req, ['admin', 'super_admin']);

export const requireSellerUser = (req: NextRequest | Request): D.User =>
  requireRole(req, ['seller', 'admin', 'super_admin']);

/** مالکیت منبع — معادل Policy::view/update */
export function ownsOr403<T extends { user_id: number }>(req: NextRequest | Request, resource: T | undefined | null): T {
  const user = requireUser(req);
  if (!resource) throw err403('منبع مورد نظر یافت نشد');
  if (resource.user_id !== user.id && user.role !== 'admin' && user.role !== 'super_admin') {
    throw err403('شما به این منبع دسترسی ندارید');
  }
  return resource;
}

/** شناسه جلسه مهمان برای سبد خرید/مقایسه مهمان */
export function sessionId(req: NextRequest | Request): string {
  return req.headers.get('x-session-id')?.trim() || 'guest-shared';
}

export interface Owner { userId: number | null; sessionId: string | null }
export function resolveOwner(req: NextRequest | Request): Owner {
  const user = currentUser(req);
  return user
    ? { userId: user.id, sessionId: null }
    : { userId: null, sessionId: sessionId(req) };
}
