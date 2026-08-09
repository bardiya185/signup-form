'use client';
/**
 * اعلان‌ها — لیست اعلان + خوانده‌شدن تکی و گروهی
 */
import { useState } from 'react';
import { Bell, CheckCheck, Package, TicketPercent, Wallet } from 'lucide-react';
import {
  useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications,
} from '@/hooks/account';
import { EmptyState, Spinner } from '@/components/ui/states';
import { Button } from '@/components/ui/button';
import { faDigits, timeAgo } from '@/lib/format';
import { cn } from '@/utils/cn';

const typeIcon = (type: string) =>
  type.includes('order') ? Package : type.includes('wallet') || type.includes('payment') ? Wallet : TicketPercent;

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [onlyUnread, setOnlyUnread] = useState(false);
  const notifications = useNotifications(page, onlyUnread);
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const list = notifications.data?.data ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-lg font-black text-zinc-900 dark:text-white">
          <Bell size={20} className="text-brand" /> اعلان‌ها
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setOnlyUnread(!onlyUnread); setPage(1); }}
            className={cn(
              'rounded-full border px-4 py-1.5 text-xs font-bold transition',
              onlyUnread ? 'border-brand bg-brand-soft text-brand dark:bg-brand/15' : 'border-zinc-200 text-zinc-500 dark:border-zinc-700',
            )}
          >
            فقط خوانده‌نشده‌ها
          </button>
          <Button size="sm" variant="outline" onClick={() => markAll.mutate()} loading={markAll.isPending}>
            <CheckCheck size={14} /> خواندن همه
          </Button>
        </div>
      </div>

      {notifications.isLoading && <div className="flex justify-center py-14"><Spinner size={30} /></div>}

      {notifications.data && list.length === 0 && (
        <EmptyState
          icon="search"
          title={onlyUnread ? 'اعلان خوانده‌نشده‌ای ندارید' : 'اعلانی وجود ندارد'}
          description="خبرهای مهم سفارش‌ها و تخفیف‌ها اینجا نمایش داده می‌شود."
        />
      )}

      <div className="space-y-2">
        {list.map((n) => {
          const Icon = typeIcon(n.type);
          return (
            <button
              key={n.id}
              onClick={() => { if (!n.isRead) markRead.mutate(n.id); }}
              className={cn(
                'flex w-full items-start gap-3 rounded-2xl border p-4 text-start transition',
                n.isRead
                  ? 'border-zinc-100 bg-white opacity-70 dark:border-zinc-800 dark:bg-zinc-900'
                  : 'border-brand/20 bg-brand-soft/40 hover:border-brand/40 dark:border-brand/30 dark:bg-brand/10',
              )}
            >
              <span className={cn(
                'flex size-10 shrink-0 items-center justify-center rounded-xl',
                n.isRead ? 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800' : 'bg-white text-brand shadow-sm dark:bg-zinc-900',
              )}>
                <Icon size={17} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-sm font-black text-zinc-800 dark:text-zinc-100">
                    {n.title}
                    {!n.isRead && <span className="size-2 rounded-full bg-brand" />}
                  </span>
                  <span className="shrink-0 text-[10px] text-zinc-400">{timeAgo(n.createdAt)}</span>
                </span>
                <span className="mt-1 block text-xs leading-6 text-zinc-500 dark:text-zinc-400">{n.body}</span>
              </span>
            </button>
          );
        })}
      </div>

      {notifications.data && notifications.data.meta.last_page > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: notifications.data.meta.last_page }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={cn(
                'size-10 rounded-xl text-sm font-bold',
                p === page ? 'bg-brand text-white' : 'bg-white text-zinc-600 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-zinc-700',
              )}
            >
              {faDigits(p)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
