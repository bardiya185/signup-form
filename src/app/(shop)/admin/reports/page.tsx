'use client';
/**
 * گزارش‌های مدیریت — ۴ تب: فروش / محصولات / کاربران / درآمد
 */
import { useState } from 'react';
import { ChartColumn, Coins, Package, ShoppingBag, Users } from 'lucide-react';
import { useAdminReport } from '@/hooks/admin';
import { PanelTitle, panelCard } from '@/components/admin/panel-shell';
import { BarChart, DonutChart, LineChart, StatsCard } from '@/components/admin/stats-card';
import { DataTable, Td, Tr } from '@/components/admin/data-table';
import { Badge } from '@/components/ui/badge';
import { faDigits, formatPrice } from '@/lib/format';
import { cn } from '@/utils/cn';
import type { ProductsReportDto, RevenueReportDto, SalesReportDto, UsersReportDto } from '@/types/admin';

type Tab = 'sales' | 'products' | 'users' | 'revenue';
const TABS: { id: Tab; label: string; icon: typeof ShoppingBag }[] = [
  { id: 'sales', label: 'فروش', icon: ShoppingBag },
  { id: 'products', label: 'محصولات', icon: Package },
  { id: 'users', label: 'کاربران', icon: Users },
  { id: 'revenue', label: 'درآمد', icon: Coins },
];

const P_STATUS_FA: Record<string, string> = {
  active: 'فعال', draft: 'پیش‌نویس', inactive: 'غیرفعال', pending_review: 'در انتظار بررسی',
};

export default function AdminReportsPage() {
  const [tab, setTab] = useState<Tab>('sales');
  const report = useAdminReport(tab);
  const data = report.data?.data as (SalesReportDto & ProductsReportDto & UsersReportDto & RevenueReportDto) | undefined;

  return (
    <div>
      <PanelTitle title="گزارش‌های فروشگاه" description="تحلیل عملکرد در بازه‌های زمانی اخیر" />

      {/* تب‌ها */}
      <div className="mb-5 flex gap-1.5 overflow-x-auto rounded-2xl border border-zinc-200 bg-white p-1.5 dark:border-zinc-800 dark:bg-zinc-900">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition',
              tab === id ? 'bg-brand text-white' : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800',
            )}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {report.isLoading && (
        <div className={cn('grid place-items-center py-20', panelCard)}>
          <span className="size-8 animate-spin rounded-full border-2 border-zinc-200 border-t-brand" />
        </div>
      )}

      {/* ─── فروش ─── */}
      {!report.isLoading && tab === 'sales' && data?.daily && (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <StatsCard icon={Coins} label="درآمد بازه" value={data.totalRevenue} isPrice />
            <StatsCard icon={ShoppingBag} label="سفارش‌های بازه" value={data.totalOrders} />
          </div>
          <div className={cn('p-5', panelCard)}>
            <h3 className="mb-4 text-sm font-black text-zinc-800 dark:text-zinc-100">روند درآمد روزانه</h3>
            <LineChart
              data={data.daily.map((d) => ({ label: faDigits(Number(d.date.slice(8))), value: d.revenue }))}
              valueFormatter={(v) => formatPrice(v)}
            />
          </div>
          <div className={cn('p-5', panelCard)}>
            <h3 className="mb-4 text-sm font-black text-zinc-800 dark:text-zinc-100">تعداد سفارش روزانه</h3>
            <BarChart data={data.daily.map((d) => ({ label: faDigits(Number(d.date.slice(8))), value: d.orders }))} showValues />
          </div>
        </div>
      )}

      {/* ─── محصولات ─── */}
      {!report.isLoading && tab === 'products' && data?.byRevenue && (
        <div className="space-y-5">
          <div className={cn('p-5', panelCard)}>
            <h3 className="mb-4 text-sm font-black text-zinc-800 dark:text-zinc-100">پربازدیدترین محصولات</h3>
            <BarChart
              data={data.topViewed.map((p) => ({ label: p.title.slice(0, 14) + '…', value: p.viewCount, hint: p.title }))}
              showValues
            />
          </div>
          <DataTable head={['محصول', 'وضعیت', 'بازدید', 'موجودی', 'فروش (عدد)', 'درآمد']} empty={data.byRevenue.length === 0}>
            {data.byRevenue.map((p) => (
              <Tr key={p.id}>
                <Td className="max-w-64 truncate font-bold text-zinc-800 dark:text-zinc-100">{p.title}</Td>
                <Td><Badge tone={p.status === 'active' ? 'green' : p.status === 'pending_review' ? 'amber' : 'zinc'}>{P_STATUS_FA[p.status] ?? p.status}</Badge></Td>
                <Td>{faDigits(p.viewCount)}</Td>
                <Td className={cn(p.stock <= 3 && 'font-black text-red-500')}>{faDigits(p.stock)}</Td>
                <Td>{faDigits(p.unitsSold)}</Td>
                <Td className="font-black text-zinc-800 dark:text-zinc-100">{formatPrice(p.revenue)}</Td>
              </Tr>
            ))}
          </DataTable>
        </div>
      )}

      {/* ─── کاربران ─── */}
      {!report.isLoading && tab === 'users' && data?.registrations && (
        <div className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className={cn('p-5', panelCard)}>
              <h3 className="mb-4 text-sm font-black text-zinc-800 dark:text-zinc-100">ثبت‌نام‌های ۶ ماه اخیر</h3>
              <BarChart data={data.registrations.map((r) => ({ label: r.label, value: r.count }))} showValues />
            </div>
            <div className={cn('flex flex-col items-center justify-center p-5', panelCard)}>
              <h3 className="mb-4 self-start text-sm font-black text-zinc-800 dark:text-zinc-100">کاربران بر اساس نقش</h3>
              <DonutChart
                data={[
                  { label: 'مشتری', value: data.byRole.customer ?? 0, color: '#10b981' },
                  { label: 'فروشنده', value: data.byRole.seller ?? 0, color: '#0ea5e9' },
                  { label: 'مدیر', value: data.byRole.admin ?? 0, color: '#ef4056' },
                ]}
              />
            </div>
          </div>
          <DataTable head={['مشتری برتر', 'تعداد سفارش', 'مجموع خرید']} empty={data.topBuyers.length === 0}>
            {data.topBuyers.map((b) => (
              <Tr key={b.id}>
                <Td className="font-bold text-zinc-800 dark:text-zinc-100">{b.name}</Td>
                <Td>{faDigits(b.ordersCount)}</Td>
                <Td className="font-black text-zinc-800 dark:text-zinc-100">{formatPrice(b.totalSpent)} تومان</Td>
              </Tr>
            ))}
          </DataTable>
        </div>
      )}

      {/* ─── درآمد ─── */}
      {!report.isLoading && tab === 'revenue' && data?.byMethod && (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <StatsCard icon={Coins} label="مبالغ بازگشتی" value={data.refunded} isPrice tone="bg-red-50 text-red-500 dark:bg-red-500/15" />
            <StatsCard icon={ChartColumn} label="شارژ کیف پول کاربران" value={data.walletDeposits} isPrice tone="bg-violet-50 text-violet-500 dark:bg-violet-500/15" />
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <div className={cn('flex flex-col items-center justify-center p-5', panelCard)}>
              <h3 className="mb-4 self-start text-sm font-black text-zinc-800 dark:text-zinc-100">درآمد به تفکیک درگاه</h3>
              <DonutChart
                data={data.byMethod.map((m, i) => ({
                  label: `${m.methodFa} (${faDigits(m.count)})`,
                  value: m.total,
                  color: ['#ef4056', '#0ea5e9', '#f59e0b', '#8b5cf6'][i % 4],
                }))}
              />
            </div>
            <div className={cn('p-5', panelCard)}>
              <h3 className="mb-4 text-sm font-black text-zinc-800 dark:text-zinc-100">درآمد ماهانه (پرداخت‌شده‌ها)</h3>
              <BarChart
                data={data.monthly.map((m) => ({ label: m.label, value: m.revenue }))}
                showValues
                valueFormatter={(v) => formatPrice(v)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
