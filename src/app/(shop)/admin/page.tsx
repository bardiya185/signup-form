'use client';
/**
 * پیشخوان ادمین — کارت‌های آمار، نمودار فروش، وضعیت سفارش‌ها، هشدارها
 */
import Link from 'next/link';
import Image from 'next/image';
import {
  Banknote, Boxes, Flame, MessageSquare, Package, ShoppingBag, Store, TrendingUp, Users,
} from 'lucide-react';
import { useAdminDashboard } from '@/hooks/admin';
import { PanelTitle, panelCard } from '@/components/admin/panel-shell';
import { StatsCard, BarChart, DonutChart } from '@/components/admin/stats-card';
import { OrderStatusBadge } from '@/components/profile/order-bits';
import { Badge } from '@/components/ui/badge';
import { PageLoading } from '@/components/ui/states';
import { faDigits, formatPrice, jdate, timeAgo } from '@/lib/format';
import type { OrderStatus } from '@/types/account';

export default function AdminDashboardPage() {
  const { data, isLoading } = useAdminDashboard();
  if (isLoading || !data) return <PageLoading label="در حال بارگذاری پیشخوان…" />;
  const d = data.data;

  const tone = (s: string) =>
    s === 'delivered' ? '#10b981' : s === 'cancelled' ? '#ef4444' : s === 'returned' ? '#8b5cf6' : s === 'shipped' ? '#f59e0b' : s === 'processing' ? '#0ea5e9' : '#71717a';

  return (
    <div className="space-y-6">
      <PanelTitle title="پیشخوان مدیریت" description={`امروز ${jdate(new Date().toISOString())}`} />

      {/* کارت‌های آمار */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        <StatsCard icon={Banknote} label="درآمد کل" value={d.cards.totalRevenue} isPrice tone="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15" />
        <StatsCard icon={TrendingUp} label="درآمد امروز" value={d.cards.todayRevenue} isPrice tone="bg-teal-50 text-teal-600 dark:bg-teal-500/15" sub={`میانگین سفارش: ${formatPrice(d.cards.averageOrderValue)} ت`} />
        <StatsCard icon={ShoppingBag} label="سفارش‌ها" value={d.cards.totalOrders} tone="bg-sky-50 text-sky-600 dark:bg-sky-500/15" sub={`امروز: ${faDigits(d.cards.todayOrders)}`} />
        <StatsCard icon={Users} label="کاربران" value={d.cards.totalUsers} tone="bg-violet-50 text-violet-600 dark:bg-violet-500/15" />
        <StatsCard icon={Package} label="محصولات" value={d.cards.totalProducts} tone="bg-amber-50 text-amber-600 dark:bg-amber-500/15" />
        <StatsCard icon={Store} label="فروشندگان" value={d.cards.totalSellers} tone="bg-rose-50 text-rose-500 dark:bg-rose-500/15" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        {/* نمودار فروش ۶ ماه */}
        <section className={`${panelCard} p-5`}>
          <h2 className="mb-4 text-sm font-black text-zinc-800 dark:text-zinc-100">فروش ۶ ماه اخیر (تومان)</h2>
          <BarChart
            data={d.salesChart.map((m) => ({ label: m.label, value: m.revenue, hint: `${faDigits(m.orders)} سفارش` }))}
            showValues
            valueFormatter={(v) => formatPrice(v)}
          />
        </section>

        {/* وضعیت سفارش‌ها */}
        <section className={`${panelCard} p-5`}>
          <h2 className="mb-4 text-sm font-black text-zinc-800 dark:text-zinc-100">وضعیت سفارش‌ها</h2>
          <DonutChart
            data={Object.entries(d.ordersByStatus).map(([k, v]) => ({
              label: { pending: 'در انتظار', processing: 'پردازش', shipped: 'ارسال شده', delivered: 'تحویل', cancelled: 'لغو', returned: 'مرجوع' }[k] ?? k,
              value: v as number,
              color: tone(k),
            }))}
            size={140}
          />
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* سفارش‌های اخیر */}
        <section className={`${panelCard} p-5 xl:col-span-2`}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-black text-zinc-800 dark:text-zinc-100">آخرین سفارش‌ها</h2>
            <Link href="/admin/orders" className="text-xs font-bold text-sky-600 dark:text-sky-400">همه سفارش‌ها ←</Link>
          </div>
          <div className="divide-y divide-zinc-50 dark:divide-zinc-800/60">
            {d.recentOrders.map((o) => (
              <Link
                key={o.id}
                href={`/admin/orders/${o.id}`}
                className="flex items-center justify-between gap-3 py-2.5 transition hover:opacity-80"
              >
                <div className="flex items-center gap-3">
                  <OrderStatusBadge status={o.status as OrderStatus} label={o.statusFa} />
                  <div>
                    <p className="font-mono text-xs font-bold text-zinc-800 dark:text-zinc-100" dir="ltr">{o.orderNumber}</p>
                    <p className="text-[10px] text-zinc-400">{o.buyer} — {timeAgo(o.createdAt)}</p>
                  </div>
                </div>
                <span className="text-sm font-black text-zinc-900 dark:text-white">{formatPrice(o.total)}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* کارهای در انتظار + کم‌موجودی */}
        <div className="space-y-6">
          <section className={`${panelCard} p-5`}>
            <h2 className="mb-3 text-sm font-black text-zinc-800 dark:text-zinc-100">در انتظار اقدام</h2>
            <ul className="space-y-2">
              {[
                { label: 'محصولات در انتظار تایید', count: d.pending.products, href: '/admin/products?status=pending_review', icon: Package },
                { label: 'دیدگاه‌های در انتظار', count: d.pending.reviews, href: '/admin/reviews?status=pending', icon: MessageSquare },
                { label: 'فروشندگان در انتظار تایید', count: d.pending.sellers, href: '/admin/sellers', icon: Store },
                { label: 'تیکت‌های باز', count: d.pending.openTickets, href: '/admin/tickets', icon: Flame },
              ].map(({ label, count, href, icon: Icon }) => (
                <li key={label}>
                  <Link href={href} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold transition hover:bg-zinc-50 dark:hover:bg-zinc-800/60">
                    <Icon size={15} className="text-zinc-400" />
                    <span className="flex-1 text-zinc-600 dark:text-zinc-300">{label}</span>
                    {count > 0 ? <Badge tone="brand">{faDigits(count)}</Badge> : <Badge tone="green">۰</Badge>}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className={`${panelCard} p-5`}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-1.5 text-sm font-black text-zinc-800 dark:text-zinc-100">
                <Boxes size={15} className="text-amber-500" /> هشدار موجودی
              </h2>
              <Link href="/warehouse/inventory?state=low_stock" className="text-[11px] font-bold text-sky-600 dark:text-sky-400">انبار ←</Link>
            </div>
            <ul className="space-y-2">
              {d.lowStock.length === 0 && <li className="text-xs text-zinc-400">همه موجودی‌ها سالم است ✅</li>}
              {d.lowStock.slice(0, 5).map((p) => (
                <li key={p.variantId} className="flex items-center justify-between gap-2 text-xs">
                  <span className="min-w-0 flex-1 truncate text-zinc-600 dark:text-zinc-300">{p.title}</span>
                  <Badge tone={p.stock === 0 ? 'red' : 'amber'}>{p.stock === 0 ? 'ناموجود' : `${faDigits(p.stock)} عدد`}</Badge>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      {/* پرفروش‌ترین محصولات */}
      <section className={`${panelCard} p-5`}>
        <h2 className="mb-4 text-sm font-black text-zinc-800 dark:text-zinc-100">پرفروش‌ترین محصولات</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {d.topProducts.map((p, i) => (
            <Link
              key={p.productId}
              href={`/admin/products?q=${encodeURIComponent(p.title.slice(0, 20))}`}
              className="flex items-center gap-3 rounded-xl border border-zinc-100 p-3 transition hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-600"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-xs font-black text-zinc-500 dark:bg-zinc-800">{faDigits(i + 1)}</span>
              {p.image && (
                <span className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-zinc-50 dark:bg-zinc-800">
                  <Image src={p.image} alt={p.title} fill className="object-contain p-1" sizes="40px" />
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-[11px] font-bold text-zinc-700 dark:text-zinc-200">{p.title}</p>
                <p className="mt-0.5 text-[10px] text-zinc-400">{faDigits(p.quantity)} فروش — {formatPrice(p.revenue)} ت</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
