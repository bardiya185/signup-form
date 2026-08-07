'use client';
/**
 * صفحه سبد خرید — اقلام، کوپن، پیشرفت ارسال رایگان و خلاصه صورتحساب
 */
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ShoppingBag, TicketPercent, Trash2, Truck } from 'lucide-react';
import {
  useApplyCoupon, useCart, useClearCart, useRemoveCartItem, useRemoveCoupon, useUpdateCartItem,
} from '@/hooks/api';
import { faDigits, formatPrice } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { QuantityInput } from '@/components/ui/quantity';
import { EmptyState, PageLoading, ErrorState } from '@/components/ui/states';
import { ConfirmDialog } from '@/components/ui/modal';
import { inputClass } from '@/components/ui/input';
import { RecentlyViewedSection } from '@/components/product/recently-viewed';

export default function CartPage() {
  const cart = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const clearCart = useClearCart();
  const applyCoupon = useApplyCoupon();
  const removeCoupon = useRemoveCoupon();
  const router = useRouter();
  const [coupon, setCoupon] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  if (cart.isLoading) return <PageLoading label="در حال بارگذاری سبد خرید…" />;
  if (cart.isError) return <div className="container-page py-10"><ErrorState onRetry={() => cart.refetch()} /></div>;

  const data = cart.data!.data;
  const { items, totals } = data;

  if (items.length === 0) {
    return (
      <>
        <div className="container-page py-16">
          <EmptyState
            icon="cart"
            title="سبد خرید شما خالی است!"
            description="می‌توانید از میان هزاران کالا، محصول موردنظرتان را پیدا کنید."
            action={<Button onClick={() => router.push('/products')}>مشاهده محصولات</Button>}
          />
        </div>
        <RecentlyViewedSection />
      </>
    );
  }

  const freeShipProgress = Math.min(
    100,
    Math.round(((totals.freeShippingThreshold - totals.remainingForFreeShipping) / Math.max(1, totals.freeShippingThreshold)) * 100),
  );

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 flex items-center gap-2 text-lg font-black text-zinc-900 dark:text-white">
        <ShoppingBag size={20} className="text-brand" />
        سبد خرید
        <span className="text-sm font-normal text-zinc-400">({faDigits(totals.itemsCount)} کالا)</span>
      </h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* اقلام */}
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.article
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 60 }}
                className="flex gap-4 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <Link href={`/products/${item.product.slug}`} className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-zinc-50 dark:bg-zinc-800 sm:size-28">
                  <Image src={item.product.image} alt={item.product.title} fill className="object-contain p-2" sizes="112px" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <Link href={`/products/${item.product.slug}`} className="line-clamp-2 text-xs font-bold leading-6 text-zinc-800 hover:text-brand dark:text-zinc-100 sm:text-sm">
                    {item.product.title}
                  </Link>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-zinc-400">
                    {item.variant.color && (
                      <span className="flex items-center gap-1">
                        <span className="size-3 rounded-full border border-black/10" style={{ backgroundColor: item.variant.color.hex }} />
                        {item.variant.color.name}
                      </span>
                    )}
                    {item.variant.size && <span>سایز {item.variant.size.name}</span>}
                    {item.variant.guarantee && <span>• {item.variant.guarantee.title}</span>}
                  </div>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                    <QuantityInput
                      size="sm"
                      value={item.quantity}
                      max={Math.min(item.variant.maxPerOrder || 10, Math.max(item.variant.stock, item.quantity))}
                      loading={updateItem.isPending && updateItem.variables?.id === item.id}
                      onChange={(q) => {
                        if (q < 1) removeItem.mutate(item.id);
                        else updateItem.mutate({ id: item.id, quantity: q });
                      }}
                    />
                    <div className="flex items-center gap-3">
                      <div className="text-end">
                        {item.variant.discountPercent > 0 && (
                          <div className="text-[11px] text-zinc-400 line-through">{formatPrice(item.variant.price * item.quantity)}</div>
                        )}
                        <div className="text-sm font-black text-zinc-900 dark:text-white">
                          {formatPrice(item.totalPrice)} <span className="text-[10px] font-normal text-zinc-400">تومان</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem.mutate(item.id)}
                        className="rounded-full p-2 text-zinc-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                        aria-label="حذف از سبد"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>

          <button
            onClick={() => setConfirmClear(true)}
            className="text-xs font-bold text-zinc-400 transition hover:text-red-500"
          >
            خالی کردن سبد خرید
          </button>
        </div>

        {/* خلاصه صورتحساب */}
        <aside className="h-fit space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 lg:sticky lg:top-24">
          {/* ارسال رایگان */}
          {totals.remainingForFreeShipping > 0 ? (
            <div className="rounded-xl bg-teal-50 p-3 text-[11px] leading-5 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
              <div className="flex items-center gap-1.5 font-bold">
                <Truck size={14} />
                با {formatPrice(totals.remainingForFreeShipping)} تومان خرید بیشتر، ارسال رایگان می‌شود
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-teal-200/60 dark:bg-teal-900">
                <motion.div className="h-full rounded-full bg-teal-500" animate={{ width: `${freeShipProgress}%` }} />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 rounded-xl bg-emerald-50 p-3 text-[11px] font-bold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
              <Truck size={14} /> هزینه ارسال برای این سبد رایگان شد 🎉
            </div>
          )}

          {/* کوپن */}
          {totals.couponCode ? (
            <div className="flex items-center justify-between rounded-xl border border-dashed border-teal-300 bg-teal-50 px-3 py-2.5 text-xs dark:border-teal-700 dark:bg-teal-500/10">
              <span className="flex items-center gap-1.5 font-black text-teal-700 dark:text-teal-300">
                <TicketPercent size={15} /> {totals.couponCode}
              </span>
              <button onClick={() => removeCoupon.mutate(undefined)} className="text-teal-600 hover:text-red-500" aria-label="حذف کوپن">
                <Trash2 size={14} />
              </button>
            </div>
          ) : (
            <form
              className="flex gap-2"
              onSubmit={(e) => { e.preventDefault(); if (coupon.trim()) applyCoupon.mutate(coupon.trim()); }}
            >
              <input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="کد تخفیف (مثلاً GINAN10)"
                className={inputClass()}
                dir="ltr"
              />
              <Button type="submit" variant="outline" loading={applyCoupon.isPending}>ثبت</Button>
            </form>
          )}

          {/* جمع‌بندی */}
          <dl className="space-y-2.5 border-t border-zinc-100 pt-4 text-sm dark:border-zinc-800">
            <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
              <dt>قیمت کالاها ({faDigits(totals.itemsCount)})</dt>
              <dd>{formatPrice(totals.subtotal)} تومان</dd>
            </div>
            {totals.discount > 0 && (
              <div className="flex justify-between text-brand">
                <dt>سود شما از خرید</dt>
                <dd>({formatPrice(totals.discount)}) تومان</dd>
              </div>
            )}
            {totals.couponDiscount > 0 && (
              <div className="flex justify-between text-teal-600 dark:text-teal-400">
                <dt>تخفیف کوپن</dt>
                <dd>({formatPrice(totals.couponDiscount)}) تومان</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-dashed border-zinc-200 pt-3 text-base font-black text-zinc-900 dark:border-zinc-700 dark:text-white">
              <dt>مبلغ قابل پرداخت</dt>
              <dd>{formatPrice(totals.total)} <span className="text-xs font-normal">تومان</span></dd>
            </div>
          </dl>

          <Button size="lg" className="w-full" onClick={() => router.push('/checkout')}>
            ادامه فرایند خرید <ChevronLeft size={17} />
          </Button>
          <Link href="/products" className="block text-center text-xs font-bold text-sky-600 hover:underline dark:text-sky-400">
            افزودن کالاهای بیشتر به سبد خرید
          </Link>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={() => { clearCart.mutate(undefined); setConfirmClear(false); }}
        title="خالی کردن سبد خرید"
        message="همه کالاها از سبد خرید شما حذف می‌شوند. مطمئن هستید؟"
        confirmText="بله، خالی کن"
      />
    </div>
  );
}
