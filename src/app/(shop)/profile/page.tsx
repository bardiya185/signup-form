'use client';
/**
 * پیشخوان کاربر — کارت‌های آماری + آخرین سفارش‌ها
 */
import Link from 'next/link';
import Image from 'next/image';
import { Bell, ChevronLeft, Heart, Package, Wallet } from 'lucide-react';
import { useOrders, useWallet } from '@/hooks/account';
import { useWishlist } from '@/hooks/api';
import { useAuthStore } from '@/stores/auth.store';
import { faDigits, formatPrice, jdate } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const cardCls = 'rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900';

export default function ProfileDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const orders = useOrders();
  const wallet = useWallet();
  const wishlist = useWishlist();
  const counters = useAuthStore((s) => s.counters);

  const stats = [
    {
      icon: Package, label: 'سفارش‌ها', href: '/profile/orders',
      value: orders.data ? `${faDigits(orders.data.meta.total)} سفارش` : '…',
      tone: 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300',
    },
    {
      icon: Wallet, label: 'موجودی کیف پول', href: '/profile/wallet',
      value: wallet.data ? `${formatPrice(wallet.data.data.balance)} تومان` : '…',
      tone: 'bg-teal-50 text-teal-600 dark:bg-teal-500/15 dark:text-teal-300',
    },
    {
      icon: Heart, label: 'علاقه‌مندی‌ها', href: '/profile/wishlist',
      value: wishlist.data ? `${faDigits(wishlist.data.data.length)} کالا` : '…',
      tone: 'bg-brand-soft text-brand dark:bg-brand/15',
    },
    {
      icon: Bell, label: 'اعلان‌های خوانده‌نشده', href: '/profile/notifications',
      value: faDigits(counters.notifications),
      tone: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
    },
  ];

  const recent = orders.data?.data.slice(0, 3) ?? [];

  return (
    <div className="space-y-6">
      <div className={cardCls}>
        <h1 className="text-lg font-black text-zinc-900 dark:text-white">
          سلام {user?.firstName} عزیز 👋
        </h1>
        <p className="mt-1 text-xs text-zinc-400">خلاصه‌ای از حساب کاربری شما در گینان‌کالا</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ icon: Icon, label, value, href, tone }) => (
          <Link key={label} href={href} className={`${cardCls} group transition hover:-translate-y-0.5 hover:shadow-lg`}>
            <div className={`mb-3 flex size-11 items-center justify-center rounded-xl ${tone}`}>
              <Icon size={20} />
            </div>
            <p className="text-xs text-zinc-400">{label}</p>
            <p className="mt-1 text-base font-black text-zinc-900 dark:text-white">{value}</p>
          </Link>
        ))}
      </div>

      {/* آخرین سفارش‌ها */}
      <section className={cardCls}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-black text-zinc-800 dark:text-zinc-100">آخرین سفارش‌ها</h2>
          <Link href="/profile/orders" className="flex items-center gap-0.5 text-xs font-bold text-sky-600 dark:text-sky-400">
            همه سفارش‌ها <ChevronLeft size={14} />
          </Link>
        </div>
        {recent.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-sm text-zinc-400">هنوز سفارشی ثبت نکرده‌اید.</p>
            <Button className="mt-4" size="sm" onClick={() => { window.location.href = '/products'; }}>شروع خرید</Button>
          </div>
        )}
        <div className="space-y-3">
          {recent.map((o) => (
            <Link
              key={o.id}
              href={`/profile/orders/${o.orderNumber}`}
              className="flex items-center gap-4 rounded-xl border border-zinc-100 p-3 transition hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-600"
            >
              <div className="flex -space-x-2 space-x-reverse">
                {o.items.slice(0, 3).map((i) => (
                  i.image && (
                    <span key={i.id} className="relative size-10 overflow-hidden rounded-full border-2 border-white bg-white dark:border-zinc-900 dark:bg-zinc-800">
                      <Image src={i.image} alt={i.productTitle} fill className="object-contain p-1" sizes="40px" />
                    </span>
                  )
                ))}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-xs font-bold text-zinc-700 dark:text-zinc-200" dir="ltr">{o.orderNumber}</p>
                <p className="mt-0.5 text-[11px] text-zinc-400">{jdate(o.createdAt)} — {faDigits(o.itemsCount)} کالا</p>
              </div>
              <Badge tone={o.status === 'delivered' ? 'green' : o.status === 'cancelled' ? 'red' : 'blue'}>{o.statusFa}</Badge>
              <span className="text-sm font-black text-zinc-800 dark:text-zinc-100">{formatPrice(o.totalAmount)}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
