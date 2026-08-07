'use client';
/**
 * اجزای مشترک سفارش — نشان وضعیت و خط‌زمان (Timeline)
 */
import { Check, CircleDashed, Truck, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { faDigits, jdatetime } from '@/lib/format';
import { cn } from '@/utils/cn';
import type { OrderHistoryDto, OrderStatus } from '@/types/account';

export const orderTone = (s: OrderStatus) =>
  s === 'delivered' ? 'green'
    : s === 'cancelled' ? 'red'
      : s === 'returned' ? 'purple'
        : s === 'shipped' ? 'amber'
          : 'blue';

export function OrderStatusBadge({ status, label }: { status: OrderStatus; label: string }) {
  return <Badge tone={orderTone(status)}>{label}</Badge>;
}

/** خط‌زمان وضعیت سفارش — از history سفارش */
export function OrderTimeline({ history }: { history: OrderHistoryDto[] }) {
  if (!history.length) return <p className="text-xs text-zinc-400">رویدادی ثبت نشده است.</p>;
  return (
    <ol className="relative space-y-6 border-s-2 border-dashed border-zinc-200 ps-6 dark:border-zinc-700">
      {history.map((h, i) => {
        const last = i === history.length - 1;
        const isCancel = h.newStatus === 'لغو شده' || h.newStatus === 'مرجوع شده';
        return (
          <li key={h.id} className="relative">
            <span
              className={cn(
                'absolute -right-[33px] top-0 flex size-5 items-center justify-center rounded-full border-2 bg-white dark:bg-zinc-900',
                last ? (isCancel ? 'border-red-400 text-red-500' : 'border-teal-500 text-teal-500') : 'border-zinc-300 text-zinc-300 dark:border-zinc-600',
              )}
            >
              {isCancel ? <X size={11} /> : last ? <Truck size={11} /> : <Check size={11} />}
            </span>
            <div>
              <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
                {h.oldStatus ? `${h.oldStatus} ← ` : ''}{h.newStatus}
              </p>
              {h.description && <p className="mt-0.5 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{h.description}</p>}
              <p className="mt-1 text-[11px] text-zinc-400">
                {jdatetime(h.createdAt)} — {h.actor}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** نوار پیشرفت وضعیت سفارش (pending→processing→shipped→delivered) */
export function OrderProgress({ status }: { status: OrderStatus }) {
  if (status === 'cancelled' || status === 'returned') return null;
  const steps: { key: OrderStatus; label: string }[] = [
    { key: 'pending', label: 'ثبت سفارش' },
    { key: 'processing', label: 'در حال پردازش' },
    { key: 'shipped', label: 'ارسال شده' },
    { key: 'delivered', label: 'تحویل شده' },
  ];
  const currentIdx = steps.findIndex((s) => s.key === status);
  return (
    <div className="flex items-center" dir="ltr">
      {steps.map((s, i) => {
        const done = i <= currentIdx;
        return (
          <div key={s.key} className="flex flex-1 flex-col items-center" dir="rtl">
            <div className="flex w-full items-center">
              <div className={cn('h-1 flex-1 rounded-full', i === 0 ? 'opacity-0' : done ? 'bg-teal-500' : 'bg-zinc-200 dark:bg-zinc-700')} />
              <div className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-full border-2',
                done ? 'border-teal-500 bg-teal-500 text-white' : 'border-zinc-300 text-zinc-300 dark:border-zinc-600',
              )}>
                {done ? <Check size={13} /> : <CircleDashed size={13} />}
              </div>
              <div className={cn('h-1 flex-1 rounded-full', i === steps.length - 1 ? 'opacity-0' : i < currentIdx ? 'bg-teal-500' : 'bg-zinc-200 dark:bg-zinc-700')} />
            </div>
            <span className={cn('mt-1.5 text-[10px] font-bold', done ? 'text-teal-600 dark:text-teal-400' : 'text-zinc-400')}>
              {faDigits(i + 1)}. {s.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
