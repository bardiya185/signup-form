'use client';
import Link from 'next/link';
import { ChartColumn, ClipboardList, Package, PackagePlus, Star, Wallet } from 'lucide-react';
import { PanelTitle } from '@/components/admin/panel-shell';
import { StatsCard } from '@/components/admin/stats-card';
import { DataTable, Td, Tr } from '@/components/admin/data-table';
import { Badge } from '@/components/ui/badge';
import { PageLoading } from '@/components/ui/states';
import { useSellerDashboard } from '@/hooks/admin';
import { faDigits, jdate } from '@/lib/format';

export default function SellerDashboardPage() {
  const { data, isLoading } = useSellerDashboard();
  if (isLoading || !data) return <PageLoading />;
  const d = data.data;
  const s = d.stats;
  return (
    <div className="space-y-6">
      <PanelTitle
        title={`سلام، ${d.seller.shopName} 👋`}
        description="نمای کلی فروشگاه شما در گینان‌کالا"
        action={
          <Link href="/seller/products/new" className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700">
            <PackagePlus className="h-4 w-4" /> ثبت کالای جدید
          </Link>
        }
      />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatsCard icon={Wallet} label="درآمد کل" value={s.totalRevenue} isPrice tone="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15" />
        <StatsCard icon={ClipboardList} label="تسویه‌حساب در انتظار" value={s.pendingSettlement} isPrice tone="bg-amber-50 text-amber-600 dark:bg-amber-500/15" />
        <StatsCard icon={Package} label="کالاهای فعال" value={s.productsActive} tone="bg-sky-50 text-sky-600 dark:bg-sky-500/15" sub={`از ${faDigits(s.productsTotal)} کالا`} />
        <StatsCard icon={Star} label="امتیاز فروشگاه" value={s.rating} tone="bg-violet-50 text-violet-600 dark:bg-violet-500/15" />
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatsCard icon={Package} label="در انتظار بررسی" value={s.productsPending} tone={s.productsPending > 0 ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/15' : undefined} />
        <StatsCard icon={ChartColumn} label="واحدهای فروخته‌شده" value={s.unitsSold} tone="bg-teal-50 text-teal-600 dark:bg-teal-500/15" />
        <StatsCard icon={ChartColumn} label="سفارش‌های مرتبط" value={s.ordersCount} tone="bg-rose-50 text-rose-500 dark:bg-rose-500/15" />
        <StatsCard
          icon={Wallet}
          label="میانگین هر سفارش"
          value={s.ordersCount > 0 ? Math.round(s.totalRevenue / s.ordersCount) : 0}
          isPrice
        />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-extrabold text-zinc-800 dark:text-zinc-100">آخرین فروش‌ها</h2>
        <DataTable head={['شماره سفارش', 'کالا', 'تعداد', 'مبلغ', 'خریدار', 'تاریخ']} empty={d.recentSales.length === 0} emptyTitle="هنوز فروشی ثبت نشده است">
          {d.recentSales.map((r, i) => (
            <Tr key={`${r.orderNumber}-${i}`}>
              <Td className="font-bold text-zinc-800 dark:text-zinc-100">{faDigits(r.orderNumber)}</Td>
              <Td className="max-w-56 truncate">{r.itemTitle}</Td>
              <Td>{faDigits(r.quantity)}</Td>
              <Td className="font-bold text-emerald-600">{faDigits(r.total.toLocaleString('en-US'))} ت</Td>
              <Td>{r.buyer}</Td>
              <Td className="text-xs">{jdate(r.createdAt)}</Td>
            </Tr>
          ))}
        </DataTable>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { href: '/seller/products', label: 'مدیریت کالاها', icon: Package },
          { href: '/seller/settlements', label: 'تسویه‌حساب‌ها', icon: Wallet },
          { href: '/seller/analytics', label: 'تحلیل فروش', icon: ChartColumn },
        ].map((l) => (
          <Link key={l.href} href={l.href} className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 text-sm font-bold text-zinc-700 transition hover:border-emerald-400 hover:text-emerald-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
            <l.icon className="h-5 w-5 text-emerald-600" /> {l.label}
          </Link>
        ))}
      </div>
      {d.seller.status !== 'approved' && (
        <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          <span>وضعیت فروشگاه شما:</span>
          <Badge tone="amber">{d.seller.statusFa}</Badge>
          <span>— پس از تأیید مدیریت، کالاها در فروشگاه نمایش داده می‌شوند.</span>
        </div>
      )}
    </div>
  );
}
