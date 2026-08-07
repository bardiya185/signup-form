import { db } from '../db';
import { err404 } from '../errors';
import { toNotificationDto } from '../resources';
import type * as D from '@/types/domain';

const now = () => new Date().toISOString();

export function listNotifications(user: D.User, page: number, perPage: number, onlyUnread = false) {
  let list = db.notifications.filter((n) => n.user_id === user.id);
  if (onlyUnread) list = list.filter((n) => !n.read_at);
  list = [...list].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  const total = list.length;
  return {
    items: list.slice((page - 1) * perPage, page * perPage).map(toNotificationDto),
    total,
    unreadCount: db.notifications.filter((n) => n.user_id === user.id && !n.read_at).length,
  };
}

export function markNotificationRead(user: D.User, id: number) {
  const notification = db.notifications.find((n) => n.id === id && n.user_id === user.id);
  if (!notification) throw err404('اعلان مورد نظر یافت نشد');
  notification.read_at ??= now();
  notification.updated_at = now();
  return toNotificationDto(notification);
}

export function markAllNotificationsRead(user: D.User): number {
  let count = 0;
  db.notifications.forEach((n) => {
    if (n.user_id === user.id && !n.read_at) {
      n.read_at = now();
      count += 1;
    }
  });
  return count;
}

export const unreadNotificationsCount = (user: D.User): number =>
  db.notifications.filter((n) => n.user_id === user.id && !n.read_at).length;
