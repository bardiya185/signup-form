'use client';
/**
 * بازگشت از درگاه پرداخت — تایید تراکنش و نمایش نتیجه
 */
import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { BadgeCheck, CircleX, RotateCcw } from 'lucide-react';
import { useVerifyPayment } from '@/hooks/account';
import { Button } from '@/components/ui/button';
import { PageLoading } from '@/components/ui/states';
import { formatPrice, jdatetime } from '@/lib/format';

function CallbackInner() {
  const sp = useSearchParams();
  const authority = sp.get('Authority');
  const status = sp.get('Status');
  const orderNumber = sp.get('order');
  const gateway = sp.get('gateway');

  const verify = useVerifyPayment(
    authority,
    status === 'OK' || status === 'NOK' ? status : status,
  );

  if (!authority || !status) {
    return (
      <Result
        tone="fail"
        title="پارامترهای بازگشت از درگاه نامعتبر است"
        description="اطلاعات تراکنش کامل نیست؛ در صورت کسر وجه، مبلغ حداکثر تا ۷۲ ساعت آینده به حساب شما برمی‌گردد."
      />
    );
  }

  if (status !== 'OK') {
    return (
      <Result
        tone="fail"
        title="پرداخت توسط شما لغو شد"
        description={orderNumber ? `سفارش ${orderNumber} در انتظار پرداخت باقی ماند و تا ۳۰ دقیقه آینده فعال است.` : undefined}
        orderNumber={orderNumber}
        retry
      />
    );
  }

  if (verify.isLoading) return <PageLoading label="در حال تایید تراکنش…" />;
  if (verify.isError) {
    return (
      <Result
        tone="fail"
        title="تایید تراکنش با خطا مواجه شد"
        description="در صورت کسر وجه، مبلغ به صورت خودکار برگشت داده می‌شود. برای پیگیری با پشتیبانی تماس بگیرید."
        action={<Button variant="outline" onClick={() => verify.refetch()}><RotateCcw size={15} /> تلاش مجدد</Button>}
      />
    );
  }

  const r = verify.data!.data;
  if (r.verified) {
    return (
      <Result
        tone="success"
        title={r.alreadyVerified ? 'این تراکنش قبلاً تایید شده بود' : 'پرداخت با موفقیت انجام شد 🎉'}
        description={r.orderNumber ? `سفارش ${r.orderNumber} با موفقیت ثبت و در حال پردازش است. جزئیات از طریق پیامک و اعلان اطلاع‌رسانی می‌شود.` : 'کیف پول شما با موفقیت شارژ شد.'}
        rows={[
          ['مبلغ تراکنش', `${formatPrice(r.payment.amount)} تومان`],
          ['شماره پیگیری (Ref)', r.payment.refNumber ?? '—'],
          ['درگاه', r.payment.methodFa],
          ['زمان', jdatetime(r.payment.paidAt ?? r.payment.createdAt)],
        ]}
        action={
          r.orderNumber
            ? <Button onClick={() => { window.location.href = `/profile/orders/${r.orderNumber}`; }}>پیگیری سفارش</Button>
            : <Button onClick={() => { window.location.href = '/profile/wallet'; }}>مشاهده کیف پول</Button>
        }
      />
    );
  }

  return (
    <Result
      tone="fail"
      title="پرداخت ناموفق بود"
      description={r.message}
      orderNumber={orderNumber}
      retry
    />
  );
}

function Result({
  tone, title, description, rows, action, orderNumber, retry,
}: {
  tone: 'success' | 'fail';
  title: string;
  description?: string;
  rows?: [string, string][];
  action?: React.ReactNode;
  orderNumber?: string | null;
  retry?: boolean;
}) {
  return (
    <div className="container-page flex min-h-[65vh] items-center justify-center py-14">
      <div className="w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-xl shadow-zinc-200/40 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/30">
        <div
          className={
            tone === 'success'
              ? 'mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 dark:bg-emerald-500/15'
              : 'mx-auto flex size-16 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-500/15'
          }
        >
          {tone === 'success' ? <BadgeCheck size={34} /> : <CircleX size={34} />}
        </div>
        <h1 className="mt-4 text-lg font-black text-zinc-900 dark:text-white">{title}</h1>
        {description && <p className="mt-2 text-sm leading-7 text-zinc-500 dark:text-zinc-400">{description}</p>}

        {rows && (
          <dl className="mt-6 space-y-2 rounded-2xl bg-zinc-50 p-4 text-sm dark:bg-zinc-800/60">
            {rows.map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <dt className="text-zinc-400">{k}</dt>
                <dd className="font-bold text-zinc-800 dark:text-zinc-100"><bdi>{v}</bdi></dd>
              </div>
            ))}
          </dl>
        )}

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          {action}
          {retry && orderNumber && (
            <Button variant="outline" onClick={() => { window.location.href = '/checkout'; }}>تلاش مجدد برای پرداخت</Button>
          )}
          <Link href="/" className="inline-flex h-11 items-center rounded-xl border border-zinc-200 px-5 text-sm font-bold text-zinc-500 transition hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800">
            بازگشت به فروشگاه
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={<PageLoading label="در حال بررسی تراکنش…" />}>
      <CallbackInner />
    </Suspense>
  );
}
