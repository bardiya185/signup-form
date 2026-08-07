'use client';
/**
 * جزئیات سفارش — پیشرفت، اقلام، آدرس، صورتحساب، خط‌زمان، لغو/مرجوع و چاپ فاکتور
 */
import { use, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Ban, MapPin, Printer, RotateCcw, Truck } from 'lucide-react';
import { useCancelOrder, useOrder, useReturnOrder } from '@/hooks/account';
import { OrderProgress, OrderStatusBadge, OrderTimeline } from '@/components/profile/order-bits';
import { PageLoading, ErrorState, EmptyState } from '@/components/ui/states';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { faDigits, formatPrice, jdatetime } from '@/lib/format';

const cardCls = 'rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900';

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = use(params);
  const order = useOrder(orderNumber);
  const cancelOrder = useCancelOrder();
  const returnOrder = useReturnOrder();
  const [action, setAction] = useState<'cancel' | 'return' | null>(null);
  const [reason, setReason] = useState('');

  if (order.isLoading) return <PageLoading label="در حال بارگذاری سفارش…" />;
  if (order.isError) {
    return (
      <EmptyState
        icon="product"
        title="سفارش یافت نشد"
        description="ممکن است شماره سفارش اشتباه باشد یا سفارش متعلق به حساب دیگری باشد."
        action={<Link href="/profile/orders"><Button size="sm">بازگشت به سفارش‌ها</Button></Link>}
      />
    );
  }

  const o = order.data!.data;
  const busy = cancelOrder.isPending || returnOrder.isPending;

  return (
    <div className="space-y-5">
      {/* سربرگ */}
      <div className={`${cardCls} print:shadow-none`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-base font-black text-zinc-900 dark:text-white">
              سفارش <bdi dir="ltr" className="font-mono">{o.orderNumber}</bdi>
            </h1>
            <p className="mt-1 text-xs text-zinc-400">{jdatetime(o.createdAt)}</p>
          </div>
          <div className="flex items-center gap-2">
            <OrderStatusBadge status={o.status} label={o.statusFa} />
            <Button variant="outline" size="sm" onClick={() => window.print()} className="print:hidden">
              <Printer size={14} /> چاپ فاکتور
            </Button>
          </div>
        </div>

        {o.cancellationReason && (
          <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-600 dark:bg-red-500/10 dark:text-red-300">
            دلیل: {o.cancellationReason}
          </p>
        )}

        <div className="mt-6"><OrderProgress status={o.status} /></div>

        {(o.canCancel || o.canReturn) && (
          <div className="mt-5 flex gap-2 print:hidden">
            {o.canCancel && (
              <Button variant="outline" size="sm" onClick={() => { setReason(''); setAction('cancel'); }}>
                <Ban size={14} /> لغو سفارش
              </Button>
            )}
            {o.canReturn && (
              <Button variant="outline" size="sm" onClick={() => { setReason(''); setAction('return'); }}>
                <RotateCcw size={14} /> درخواست مرجوعی
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          {/* اقلام */}
          <section className={cardCls}>
            <h2 className="mb-4 text-sm font-black text-zinc-800 dark:text-zinc-100">
              کالاهای سفارش ({faDigits(o.itemsCount)})
            </h2>
            <div className="space-y-4">
              {o.items.map((i) => (
                <div key={i.id} className="flex items-center gap-4 border-b border-zinc-50 pb-4 last:border-0 last:pb-0 dark:border-zinc-800/60">
                  {i.image && (
                    <Link href={i.productSlug ? `/products/${i.productSlug}` : '#'} className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-zinc-50 dark:bg-zinc-800">
                      <Image src={i.image} alt={i.productTitle} fill className="object-contain p-1.5" sizes="64px" />
                    </Link>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-xs font-bold leading-6 text-zinc-800 dark:text-zinc-100">{i.productTitle}</p>
                    <p className="mt-1 text-[11px] text-zinc-400">{i.variantInfo}</p>
                  </div>
                  <div className="text-end text-xs">
                    <p className="text-zinc-400">× {faDigits(i.quantity)}</p>
                    <p className="mt-1 font-black text-zinc-800 dark:text-zinc-100">{formatPrice(i.totalPrice)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* خط‌زمان */}
          <section className={`${cardCls} print:hidden`}>
            <h2 className="mb-5 flex items-center gap-2 text-sm font-black text-zinc-800 dark:text-zinc-100">
              <Truck size={16} className="text-brand" /> روند سفارش
            </h2>
            <OrderTimeline history={o.history ?? []} />
          </section>
        </div>

        <div className="space-y-5">
          {/* آدرس */}
          <section className={cardCls}>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-black text-zinc-800 dark:text-zinc-100">
              <MapPin size={16} className="text-brand" /> آدرس تحویل
            </h2>
            {o.address && (
              <div className="text-xs leading-6 text-zinc-500 dark:text-zinc-400">
                <p>{o.address.province?.name}، {o.address.city?.name}، {o.address.fullAddress}</p>
                <p className="mt-2 border-t border-dashed border-zinc-100 pt-2 dark:border-zinc-800">
                  گیرنده: {o.address.receiverName} — <bdi dir="ltr">{o.address.receiverPhone}</bdi>
                </p>
              </div>
            )}
          </section>

          {/* صورتحساب */}
          <section className={cardCls}>
            <h2 className="mb-3 text-sm font-black text-zinc-800 dark:text-zinc-100">صورتحساب</h2>
            <dl className="space-y-2 text-xs">
              <Row k="قیمت کالاها" v={`${formatPrice(o.subtotal)} تومان`} />
              <Row k="هزینه ارسال" v={o.shippingCost === 0 ? 'رایگان' : `${formatPrice(o.shippingCost)} تومان`} />
              {o.taxAmount > 0 && <Row k="مالیات" v={`${formatPrice(o.taxAmount)} تومان`} />}
              {o.discountAmount > 0 && <Row k="تخفیف کالاها" v={`(${formatPrice(o.discountAmount)}) تومان`} accent />}
              {o.couponDiscount > 0 && <Row k="تخفیف کوپن" v={`(${formatPrice(o.couponDiscount)}) تومان`} accent />}
              <div className="flex justify-between border-t border-dashed border-zinc-200 pt-2.5 text-sm font-black text-zinc-900 dark:border-zinc-700 dark:text-white">
                <dt>مبلغ نهایی</dt><dd>{formatPrice(o.totalAmount)} تومان</dd>
              </div>
              <Row k="روش پرداخت" v={o.paymentMethodFa} />
              <Row k="وضعیت پرداخت" v={o.paymentStatusFa} />
            </dl>
          </section>
        </div>
      </div>

      {/* مودال لغو/مرجوع */}
      <Modal open={action != null} onClose={() => setAction(null)} title={action === 'cancel' ? 'لغو سفارش' : 'درخواست مرجوع کالا'} size="sm">
        <div className="space-y-4">
          <p className="text-sm leading-7 text-zinc-500 dark:text-zinc-400">
            {action === 'cancel'
              ? 'پس از لغو سفارش، مبلغ پرداخت‌شده به کیف پول شما برمی‌گردد.'
              : 'پس از بررسی کارشناسان، نتیجه درخواست مرجوعی به شما اعلام می‌شود.'}
          </p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="دلیل خود را بنویسید…"
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand dark:border-zinc-700 dark:bg-zinc-950"
          />
          <Button
            className="w-full"
            variant={action === 'cancel' ? 'danger' : 'primary'}
            disabled={reason.trim().length < 3}
            loading={busy}
            onClick={() => {
              const input = { orderNumber: o.orderNumber, reason: reason.trim() };
              const opts = { onSuccess: () => setAction(null) };
              if (action === 'cancel') cancelOrder.mutate(input, opts);
              else returnOrder.mutate(input, opts);
            }}
          >
            {action === 'cancel' ? 'تایید لغو سفارش' : 'ثبت درخواست مرجوعی'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

const Row = ({ k, v, accent }: { k: string; v: string; accent?: boolean }) => (
  <div className="flex justify-between">
    <dt className="text-zinc-400">{k}</dt>
    <dd className={accent ? 'font-bold text-brand' : 'font-bold text-zinc-700 dark:text-zinc-200'}>{v}</dd>
  </div>
);
