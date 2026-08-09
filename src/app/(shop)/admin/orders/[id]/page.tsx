'use client';
/**
 * جزئیات سفارش (ادمین) — اقلام، پرداخت‌ها، آدرس + مدیریت وضعیت با گذر مجاز
 */
import { use, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import { useAdminOrderDetail, useAdminUpdateOrderStatus } from '@/hooks/admin';
import { PanelTitle, panelCard } from '@/components/admin/panel-shell';
import { OrderStatusBadge, OrderTimeline } from '@/components/profile/order-bits';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageLoading, EmptyState } from '@/components/ui/states';
import { faDigits, formatPrice, jdatetime } from '@/lib/format';
import type { OrderStatus } from '@/types/account';

const TRANSITIONS: Record<string, { to: OrderStatus; label: string }[]> = {
  pending: [
    { to: 'processing', label: 'تایید و پردازش' },
    { to: 'cancelled', label: 'لغو سفارش' },
  ],
  processing: [
    { to: 'shipped', label: 'ارسال شد' },
    { to: 'cancelled', label: 'لغو سفارش' },
  ],
  shipped: [{ to: 'delivered', label: 'تحویل داده شد' }],
  delivered: [{ to: 'returned', label: 'مرجوع شد' }],
  cancelled: [],
  returned: [],
};

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const order = useAdminOrderDetail(id);
  const updateStatus = useAdminUpdateOrderStatus();
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});

  if (order.isLoading) return <PageLoading label="در حال بارگذاری سفارش…" />;
  if (order.isError || !order.data) {
    return <EmptyState icon="product" title="سفارش یافت نشد" action={<Link href="/admin/orders"><Button size="sm">بازگشت</Button></Link>} />;
  }

  const o = order.data.data;
  const nexts = TRANSITIONS[o.status] ?? [];

  return (
    <div className="space-y-5">
      <Link href="/admin/orders" className="flex w-fit items-center gap-1 text-xs font-bold text-zinc-400 transition hover:text-brand">
        <ChevronRight size={14} /> همه سفارش‌ها
      </Link>

      <div className={`${panelCard} p-5`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-base font-black text-zinc-900 dark:text-white">
              سفارش <bdi dir="ltr" className="font-mono">{o.orderNumber}</bdi>
            </h1>
            <p className="mt-1 text-xs text-zinc-400">{jdatetime(o.createdAt)} — خریدار: {o.buyerName}</p>
          </div>
          <div className="flex items-center gap-2">
            <OrderStatusBadge status={o.status} label={o.statusFa} />
            <Badge tone={o.paymentStatus === 'paid' ? 'green' : 'amber'}>{o.paymentStatusFa}</Badge>
          </div>
        </div>

        {/* مدیریت وضعیت */}
        {nexts.length > 0 && (
          <div className="mt-5 space-y-3 rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
            <p className="text-xs font-black text-zinc-700 dark:text-zinc-200">تغییر وضعیت سفارش:</p>
            <div className="flex flex-wrap gap-2">
              {nexts.map((n) => (
                <div key={n.to} className="flex items-center gap-1.5">
                  <input
                    value={noteMap[n.to] ?? ''}
                    onChange={(e) => setNoteMap({ ...noteMap, [n.to]: e.target.value })}
                    placeholder="توضیح (اختیاری)"
                    className="h-9 w-36 rounded-lg border border-zinc-200 bg-white px-3 text-xs outline-none focus:border-brand dark:border-zinc-700 dark:bg-zinc-900"
                  />
                  <Button
                    size="sm"
                    variant={n.to === 'cancelled' || n.to === 'returned' ? 'danger' : 'primary'}
                    loading={updateStatus.isPending}
                    onClick={() => updateStatus.mutate({ id: o.id, status: n.to, description: noteMap[n.to]?.trim() || undefined })}
                  >
                    {n.to === 'cancelled' || n.to === 'returned' ? n.label : <><CheckCircle2 size={14} /> {n.label}</>}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          {/* اقلام */}
          <section className={`${panelCard} p-5`}>
            <h2 className="mb-4 text-sm font-black text-zinc-800 dark:text-zinc-100">اقلام ({faDigits(o.itemsCount)})</h2>
            <div className="space-y-3">
              {o.items.map((i) => (
                <div key={i.id} className="flex items-center gap-3 border-b border-zinc-50 pb-3 last:border-0 last:pb-0 dark:border-zinc-800/60">
                  {i.image && (
                    <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-zinc-50 dark:bg-zinc-800">
                      <Image src={i.image} alt={i.productTitle} fill className="object-contain p-1" sizes="56px" />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-xs font-bold text-zinc-800 dark:text-zinc-100">{i.productTitle}</p>
                    <p className="mt-0.5 text-[10px] text-zinc-400">{i.variantInfo}</p>
                  </div>
                  <div className="text-end text-xs">
                    <p className="text-zinc-400">× {faDigits(i.quantity)}</p>
                    <p className="font-black text-zinc-800 dark:text-zinc-100">{formatPrice(i.totalPrice)}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* جمع */}
            <dl className="mt-4 space-y-1.5 border-t border-dashed border-zinc-200 pt-4 text-xs dark:border-zinc-700">
              <div className="flex justify-between text-zinc-500"><dt>جمع کالاها</dt><dd>{formatPrice(o.subtotal)}</dd></div>
              <div className="flex justify-between text-zinc-500"><dt>ارسال</dt><dd>{o.shippingCost === 0 ? 'رایگان' : formatPrice(o.shippingCost)}</dd></div>
              {o.discountAmount > 0 && <div className="flex justify-between text-brand"><dt>تخفیف کالاها</dt><dd>({formatPrice(o.discountAmount)})</dd></div>}
              {o.couponDiscount > 0 && <div className="flex justify-between text-teal-600"><dt>کوپن</dt><dd>({formatPrice(o.couponDiscount)})</dd></div>}
              <div className="flex justify-between pt-1.5 text-sm font-black text-zinc-900 dark:text-white"><dt>مبلغ نهایی</dt><dd>{formatPrice(o.totalAmount)} تومان</dd></div>
            </dl>
          </section>

          {/* تاریخچه */}
          <section className={`${panelCard} p-5`}>
            <h2 className="mb-4 text-sm font-black text-zinc-800 dark:text-zinc-100">تاریخچه وضعیت</h2>
            <OrderTimeline history={o.history ?? []} />
          </section>
        </div>

        <div className="space-y-5">
          {/* پرداخت‌ها */}
          <section className={`${panelCard} p-5`}>
            <h2 className="mb-3 text-sm font-black text-zinc-800 dark:text-zinc-100">تراکنش‌های پرداخت</h2>
            {(o.payments ?? []).length === 0 && <p className="text-xs text-zinc-400">تراکنشی ثبت نشده است.</p>}
            <ul className="space-y-2.5">
              {(o.payments ?? []).map((p) => (
                <li key={p.id} className="rounded-xl border border-zinc-100 p-3 text-xs dark:border-zinc-800">
                  <div className="flex justify-between">
                    <span className="font-bold text-zinc-700 dark:text-zinc-200">{p.methodFa}</span>
                    <Badge tone={p.status === 'success' ? 'green' : p.status === 'failed' ? 'red' : 'amber'}>{p.statusFa}</Badge>
                  </div>
                  <p className="mt-1.5 font-black text-zinc-900 dark:text-white">{formatPrice(p.amount)} تومان</p>
                  {p.refNumber && <p className="mt-1 text-[10px] text-zinc-400">Ref: <bdi dir="ltr" className="font-mono">{p.refNumber}</bdi></p>}
                  <p className="mt-0.5 text-[10px] text-zinc-400">{jdatetime(p.createdAt)}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* آدرس */}
          <section className={`${panelCard} p-5`}>
            <h2 className="mb-3 text-sm font-black text-zinc-800 dark:text-zinc-100">آدرس تحویل</h2>
            {o.address && (
              <div className="text-xs leading-6 text-zinc-500 dark:text-zinc-400">
                <p>{o.address.province?.name}، {o.address.city?.name}، {o.address.fullAddress}</p>
                <p className="mt-2 border-t border-dashed border-zinc-100 pt-2 dark:border-zinc-800">
                  {o.address.receiverName} — <bdi dir="ltr">{o.address.receiverPhone}</bdi>
                </p>
              </div>
            )}
          </section>

          {o.notes && (
            <section className={`${panelCard} p-5 text-xs leading-6 text-zinc-500 dark:text-zinc-400`}>
              <h2 className="mb-2 text-sm font-black text-zinc-800 dark:text-zinc-100">یادداشت خریدار</h2>
              {o.notes}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
