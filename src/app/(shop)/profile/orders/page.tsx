'use client';
/**
 * لیست سفارش‌های کاربر + فیلتر وضعیت + صفحه‌بندی
 */
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package } from 'lucide-react';
import { useOrders } from '@/hooks/account';
import { OrderStatusBadge } from '@/components/profile/order-bits';
import { EmptyState, Spinner } from '@/components/ui/states';
import { Button } from '@/components/ui/button';
import { faDigits, formatPrice, jdate } from '@/lib/format';
import { cn } from '@/utils/cn';
import type { OrderStatus } from '@/types/account';

const FILTERS: { key: OrderStatus | 'all' | 'current'; label: string }[] = [
  { key: 'all', label: 'همه' },
  { key: 'pending', label: 'در انتظار پرداخت' },
  { key: 'processing', label: 'در حال پردازش' },
  { key: 'shipped', label: 'ارسال شده' },
  { key: 'delivered', label: 'تحویل شده' },
  { key: 'cancelled', label: 'لغو شده' },
  { key: 'returned', label: 'مرجوع شده' },
];

export default function OrdersPage() {
  const [status, setStatus] = useState<OrderStatus | undefined>(undefined);
  const [page, setPage] = useState(1);
  const orders = useOrders(status, page);

  return (
    <div className="space-y-5">
      <h1 className="flex items-center gap-2 text-lg font-black text-zinc-900 dark:text-white">
        <Package size={20} className="text-brand" /> سفارش‌های من
      </h1>

      {/* فیلتر وضعیت */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => { setStatus(f.key === 'all' ? undefined : (f.key as OrderStatus)); setPage(1); }}
            className={cn(
              'whitespace-nowrap rounded-full border px-4 py-1.5 text-xs font-bold transition',
              (f.key === 'all' ? status === undefined : status === f.key)
                ? 'border-brand bg-brand-soft text-brand dark:bg-brand/15'
                : 'border-zinc-200 text-zinc-500 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {orders.isLoading && <div className="flex justify-center py-14"><Spinner size={30} /></div>}

      {orders.data && orders.data.data.length === 0 && (
        <EmptyState
          icon="product"
          title="سفارشی با این وضعیت ندارید"
          description="با ثبت اولین سفارش، اینجا پر از خریدهای خوب می‌شود."
          action={<Link href="/products"><Button size="sm">شروع خرید</Button></Link>}
        />
      )}

      <div className="space-y-3">
        {orders.data?.data.map((o) => (
          <Link
            key={o.id}
            href={`/profile/orders/${o.orderNumber}`}
            className="block rounded-2xl border border-zinc-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-dashed border-zinc-100 pb-3 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <OrderStatusBadge status={o.status} label={o.statusFa} />
                <span className="text-[11px] text-zinc-400">{jdate(o.createdAt)}</span>
              </div>
              <span className="font-mono text-xs text-zinc-400" dir="ltr">{o.orderNumber}</span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="flex -space-x-2 space-x-reverse">
                {o.items.slice(0, 4).map((i) => (
                  i.image && (
                    <span key={i.id} className="relative size-12 overflow-hidden rounded-full border-2 border-white bg-white dark:border-zinc-900 dark:bg-zinc-800">
                      <Image src={i.image} alt={i.productTitle} fill className="object-contain p-1" sizes="48px" />
                    </span>
                  )
                ))}
              </div>
              <div className="text-end">
                <p className="text-[11px] text-zinc-400">{faDigits(o.itemsCount)} کالا</p>
                <p className="text-sm font-black text-zinc-900 dark:text-white">
                  {formatPrice(o.totalAmount)} <span className="text-[10px] font-normal text-zinc-400">تومان</span>
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* صفحه‌بندی */}
      {orders.data && orders.data.meta.last_page > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: orders.data.meta.last_page }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={cn(
                'size-10 rounded-xl text-sm font-bold transition',
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
