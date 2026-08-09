'use client';
/**
 * صفحه تسویه حساب — ۳ گام: آدرس، روش ارسال، پرداخت
 */
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  BadgeCheck, ChevronRight, CreditCard, Edit3, MapPin, Plus, Truck, Wallet,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useCart } from '@/hooks/api';
import {
  useAddresses, useCheckout, useCreatePayment, useShippingMethods, useWallet,
} from '@/hooks/account';
import { CheckoutStepper } from '@/components/checkout/checkout-stepper';
import { AddressFormModal } from '@/components/checkout/address-form-modal';
import { Button } from '@/components/ui/button';
import { PageLoading, ErrorState } from '@/components/ui/states';
import { faDigits, formatPrice } from '@/lib/format';
import { cn } from '@/utils/cn';
import type { OrderDto } from '@/types/account';

const GATEWAYS = [
  { id: 'zarinpal', title: 'زرین‌پال', desc: 'پرداخت امن با همه کارت‌های شتاب' },
  { id: 'mellat', title: 'درگاه بانک ملت (به‌پرداخت)', desc: 'پرداخت اینترنتی بانک ملت' },
  { id: 'saman', title: 'درگاه بانک سامان (سپ)', desc: 'پرداخت اینترنتی بانک سامان' },
] as const;

export default function CheckoutPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);

  const cart = useCart();
  const addresses = useAddresses();
  const shippingMethods = useShippingMethods();
  const wallet = useWallet();
  const checkout = useCheckout();
  const createPayment = useCreatePayment();

  const [step, setStep] = useState(1);
  const [addressId, setAddressId] = useState<number | null>(null);
  const [methodId, setMethodId] = useState<number | null>(null);
  const [gateway, setGateway] = useState<'zarinpal' | 'mellat' | 'saman' | 'wallet'>('zarinpal');
  const [notes, setNotes] = useState('');
  const [addressModal, setAddressModal] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<OrderDto | null>(null);

  // نگه‌داشت جریان ورود/سبد
  useEffect(() => {
    if (initialized && !user) router.replace('/login?next=/checkout');
  }, [initialized, user, router]);

  useEffect(() => {
    const def = addresses.data?.data.find((a) => a.isDefault) ?? addresses.data?.data[0];
    if (addressId == null && def) setAddressId(def.id);
  }, [addresses.data, addressId]);

  useEffect(() => {
    const first = shippingMethods.data?.data[0];
    if (methodId == null && first) setMethodId(first.id);
  }, [shippingMethods.data, methodId]);

  const method = useMemo(
    () => shippingMethods.data?.data.find((m) => m.id === methodId),
    [shippingMethods.data, methodId],
  );

  if (!initialized || !user) return <PageLoading />;
  if (cart.isLoading) return <PageLoading label="در حال آماده‌سازی تسویه حساب…" />;
  if (cart.isError) return <div className="container-page py-10"><ErrorState onRetry={() => cart.refetch()} /></div>;

  const totals = cart.data!.data.totals;
  const items = cart.data!.data.items;

  if (items.length === 0 && !placedOrder) {
    router.replace('/cart');
    return <PageLoading />;
  }

  const shippingCost = totals.remainingForFreeShipping === 0 ? 0 : (method?.cost ?? 0);
  const payable = totals.total + shippingCost;
  const walletBalance = wallet.data?.data.balance ?? 0;
  const canPayWithWallet = walletBalance >= payable;

  const submitOrder = () => {
    if (!addressId) return;
    checkout.mutate(
      { address_id: addressId, shipping_method_id: methodId ?? undefined, payment_method: gateway, notes: notes || undefined },
      {
        onSuccess: (res) => {
          const result = res.data;
          if (!result.requiresRedirect) {
            setPlacedOrder(result.order);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
          }
          createPayment.mutate(
            { order_number: result.order.orderNumber, gateway: gateway as 'zarinpal' },
            { onSuccess: (pay) => { window.location.href = pay.data.payUrl; } },
          );
        },
      },
    );
  };

  // ───── نمای موفقیت سفارش (پرداخت کیف پول) ─────
  if (placedOrder) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 dark:bg-emerald-500/15">
          <BadgeCheck size={44} />
        </div>
        <h1 className="mt-5 text-xl font-black text-zinc-900 dark:text-white">سفارش شما با موفقیت ثبت شد 🎉</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          شماره سفارش: <bdi className="font-mono font-black text-zinc-800 dark:text-zinc-100">{placedOrder.orderNumber}</bdi>
        </p>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          مبلغ {formatPrice(placedOrder.totalAmount)} تومان از کیف پول شما پرداخت شد.
        </p>
        <div className="mt-7 flex gap-3">
          <Button onClick={() => router.push(`/profile/orders/${placedOrder.orderNumber}`)}>پیگیری سفارش</Button>
          <Button variant="outline" onClick={() => router.push('/products')}>بازگشت به فروشگاه</Button>
        </div>
      </div>
    );
  }

  const sectionCard = 'rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900';

  return (
    <div className="container-page py-8">
      <CheckoutStepper current={step} />

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          {/* گام ۱: آدرس */}
          <section className={cn(sectionCard, step !== 1 && 'opacity-90')}>
            <header className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-black text-zinc-800 dark:text-zinc-100">
                <MapPin size={17} className="text-brand" /> آدرس تحویل سفارش
              </h2>
              {step > 1 && (
                <button onClick={() => setStep(1)} className="flex items-center gap-1 text-xs font-bold text-sky-600 dark:text-sky-400">
                  <Edit3 size={13} /> تغییر
                </button>
              )}
            </header>

            {step === 1 ? (
              <>
                {addresses.isLoading && <p className="text-sm text-zinc-400">در حال بارگذاری آدرس‌ها…</p>}
                <div className="grid gap-3 sm:grid-cols-2">
                  {addresses.data?.data.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setAddressId(a.id)}
                      className={cn(
                        'rounded-xl border-2 p-4 text-start transition',
                        addressId === a.id
                          ? 'border-brand bg-brand-soft/60 dark:bg-brand/10'
                          : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-700',
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-zinc-800 dark:text-zinc-100">{a.title}</span>
                        {a.isDefault && <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-600 dark:bg-teal-500/15">پیش‌فرض</span>}
                      </div>
                      <p className="mt-2 text-xs leading-6 text-zinc-500 dark:text-zinc-400">
                        {a.province?.name}، {a.city?.name}، {a.fullAddress}
                      </p>
                      <p className="mt-1 text-[11px] text-zinc-400">{a.receiverName} — <bdi dir="ltr">{a.receiverPhone}</bdi></p>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setAddressModal(true)}
                    className="flex min-h-28 flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-zinc-300 text-xs font-bold text-zinc-400 transition hover:border-brand hover:text-brand dark:border-zinc-700"
                  >
                    <Plus size={20} /> افزودن آدرس جدید
                  </button>
                </div>
                <Button className="mt-5 w-full sm:w-auto" size="lg" disabled={!addressId} onClick={() => setStep(2)}>
                  ثبت آدرس و ادامه
                </Button>
              </>
            ) : (
              (() => {
                const a = addresses.data?.data.find((x) => x.id === addressId);
                return a && (
                  <p className="text-xs leading-6 text-zinc-500 dark:text-zinc-400">
                    {a.province?.name}، {a.city?.name}، {a.fullAddress} — {a.receiverName}
                  </p>
                );
              })()
            )}
          </section>

          {/* گام ۲: روش ارسال */}
          {step >= 2 && (
            <section className={cn(sectionCard, step !== 2 && 'opacity-90')}>
              <header className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-black text-zinc-800 dark:text-zinc-100">
                  <Truck size={17} className="text-brand" /> روش ارسال
                </h2>
                {step > 2 && (
                  <button onClick={() => setStep(2)} className="flex items-center gap-1 text-xs font-bold text-sky-600 dark:text-sky-400">
                    <Edit3 size={13} /> تغییر
                  </button>
                )}
              </header>
              {step === 2 ? (
                <>
                  <div className="space-y-2.5">
                    {shippingMethods.data?.data.map((m) => (
                      <label
                        key={m.id}
                        className={cn(
                          'flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition',
                          methodId === m.id ? 'border-brand bg-brand-soft/60 dark:bg-brand/10' : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-700',
                        )}
                      >
                        <span className="flex items-center gap-3">
                          <input
                            type="radio" name="shipping" className="size-4 accent-brand"
                            checked={methodId === m.id} onChange={() => setMethodId(m.id)}
                          />
                          <span>
                            <span className="block text-sm font-bold text-zinc-800 dark:text-zinc-100">{m.title}</span>
                            <span className="text-[11px] text-zinc-400">تحویل تقریبی {faDigits(m.estimated_days)} روز کاری</span>
                          </span>
                        </span>
                        <span className="text-sm font-black text-zinc-800 dark:text-zinc-100">
                          {m.cost === 0 ? 'رایگان' : `${formatPrice(m.cost)} تومان`}
                        </span>
                      </label>
                    ))}
                  </div>
                  {totals.remainingForFreeShipping === 0 && (
                    <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-[11px] font-bold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                      🎉 به دلیل عبور سبد از سقف ارسال رایگان، هزینه ارسال شما صفر شد.
                    </p>
                  )}
                  <div className="mt-5 flex gap-3">
                    <Button size="lg" disabled={!methodId} onClick={() => setStep(3)}>ثبت روش ارسال و ادامه</Button>
                    <Button size="lg" variant="ghost" onClick={() => setStep(1)}><ChevronRight size={16} /> بازگشت</Button>
                  </div>
                </>
              ) : (
                method && <p className="text-xs text-zinc-500 dark:text-zinc-400">{method.title} — {method.cost === 0 ? 'رایگان' : `${formatPrice(method.cost)} تومان`}</p>
              )}
            </section>
          )}

          {/* گام ۳: پرداخت */}
          {step >= 3 && (
            <section className={sectionCard}>
              <header className="mb-4">
                <h2 className="flex items-center gap-2 text-sm font-black text-zinc-800 dark:text-zinc-100">
                  <CreditCard size={17} className="text-brand" /> روش پرداخت
                </h2>
              </header>
              <div className="space-y-2.5">
                {canPayWithWallet && (
                  <label
                    className={cn(
                      'flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition',
                      gateway === 'wallet' ? 'border-brand bg-brand-soft/60 dark:bg-brand/10' : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-700',
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <input type="radio" name="gateway" className="size-4 accent-brand" checked={gateway === 'wallet'} onChange={() => setGateway('wallet')} />
                      <span>
                        <span className="flex items-center gap-1.5 text-sm font-bold text-zinc-800 dark:text-zinc-100"><Wallet size={15} /> کیف پول گینان‌کالا</span>
                        <span className="text-[11px] text-zinc-400">موجودی: {formatPrice(walletBalance)} تومان</span>
                      </span>
                    </span>
                  </label>
                )}
                {GATEWAYS.map((g) => (
                  <label
                    key={g.id}
                    className={cn(
                      'flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition',
                      gateway === g.id ? 'border-brand bg-brand-soft/60 dark:bg-brand/10' : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-700',
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <input type="radio" name="gateway" className="size-4 accent-brand" checked={gateway === g.id} onChange={() => setGateway(g.id)} />
                      <span>
                        <span className="block text-sm font-bold text-zinc-800 dark:text-zinc-100">{g.title}</span>
                        <span className="text-[11px] text-zinc-400">{g.desc}</span>
                      </span>
                    </span>
                  </label>
                ))}
              </div>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="یادداشت سفارش (اختیاری) — مثلاً ساعت تحویل"
                className="mt-4 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-xs outline-none transition focus:border-brand dark:border-zinc-700 dark:bg-zinc-950"
              />
            </section>
          )}
        </div>

        {/* خلاصه سفارش */}
        <aside className={cn(sectionCard, 'h-fit lg:sticky lg:top-24')}>
          <h3 className="mb-4 text-sm font-black text-zinc-800 dark:text-zinc-100">خلاصه سفارش</h3>
          <div className="mb-4 flex -space-x-3 space-x-reverse overflow-hidden">
            {items.slice(0, 5).map((i) => (
              <div key={i.id} className="relative size-12 overflow-hidden rounded-full border-2 border-white bg-white dark:border-zinc-900 dark:bg-zinc-800">
                <Image src={i.product.image} alt={i.product.title} fill className="object-contain p-1" sizes="48px" />
              </div>
            ))}
            {items.length > 5 && (
              <span className="z-10 flex size-12 items-center justify-center rounded-full border-2 border-white bg-zinc-100 text-[10px] font-black text-zinc-500 dark:border-zinc-900 dark:bg-zinc-800">
                +{faDigits(items.length - 5)}
              </span>
            )}
          </div>
          <dl className="space-y-2.5 text-sm">
            <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
              <dt>قیمت کالاها ({faDigits(totals.itemsCount)})</dt><dd>{formatPrice(totals.subtotal)}</dd>
            </div>
            {totals.discount + totals.couponDiscount > 0 && (
              <div className="flex justify-between text-brand">
                <dt>تخفیف</dt><dd>({formatPrice(totals.discount + totals.couponDiscount)})</dd>
              </div>
            )}
            <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
              <dt>هزینه ارسال</dt>
              <dd>{shippingCost === 0 ? <span className="font-bold text-teal-600 dark:text-teal-400">رایگان</span> : formatPrice(shippingCost)}</dd>
            </div>
            <div className="flex justify-between border-t border-dashed border-zinc-200 pt-3 text-base font-black text-zinc-900 dark:border-zinc-700 dark:text-white">
              <dt>مبلغ قابل پرداخت</dt>
              <dd>{formatPrice(payable)} <span className="text-xs font-normal">تومان</span></dd>
            </div>
          </dl>
          {step === 3 && (
            <Button
              size="lg" className="mt-5 w-full"
              loading={checkout.isPending || createPayment.isPending}
              onClick={submitOrder}
            >
              {gateway === 'wallet' ? 'پرداخت و ثبت نهایی سفارش' : 'پرداخت و ثبت سفارش'}
            </Button>
          )}
          <Link href="/cart" className="mt-3 block text-center text-xs font-bold text-zinc-400 transition hover:text-brand">
            بازگشت به سبد خرید
          </Link>
        </aside>
      </div>

      <AddressFormModal open={addressModal} onClose={() => setAddressModal(false)} />
    </div>
  );
}
