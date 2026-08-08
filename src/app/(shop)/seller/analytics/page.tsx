'use client';
import { BadgePercent, Package, Wallet } from 'lucide-react';
import { PanelTitle } from '@/components/admin/panel-shell';
import { BarChart, StatsCard } from '@/components/admin/stats-card';
import { DataTable, Td, Tr } from '@/components/admin/data-table';
import { PageLoading } from '@/components/ui/states';
import { useSellerAnalytics } from '@/hooks/admin';
import { faDigits, formatPrice } from '@/lib/format';

export default function SellerAnalyticsPage() {
  const { data, isLoading } = useSellerAnalytics();
  if (isLoading || !data) return <PageLoading />;
  const d = data.data;

  return (
    <div className="space-y-6">
      <PanelTitle title="تحلیل فروش" description="عملکرد فروشگاه شما در ماه‌های اخیر" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatsCard icon={BadgePercent} label="نرخ کمیسیون بازار" value={`${faDigits(d.commissionRate)}٪`} tone="bg-violet-50 text-violet-600 dark:bg-violet-500/15" />
        <StatsCard icon={Wallet} label="درآمد خالص (پس از کمیسیون)" value={d.netRevenue} isPrice tone="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15" />
        <StatsCard icon={Package} label="تعداد کالاهای پرفروش" value={d.topProducts.length} tone="bg-amber-50 text-amber-600 dark:bg-amber-500/15" />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-extrabold text-zinc-800 dark:text-zinc-100">روند فروش ماهانه</h2>
        <BarChart
          data={d.monthly.map((m) => ({
            label: m.label,
            value: m.revenue,
            hint: `${faDigits(m.units)} واحد`,
          }))}
          valueFormatter={(v) => `${faDigits(Math.round(v / 1_000_000))} میلیون تومان`}
        />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-extrabold text-zinc-800 dark:text-zinc-100">پرفروش‌ترین کالاها</h2>
        <DataTable head={['کالا', 'واحد فروش', 'درآمد']} empty={d.topProducts.length === 0} emptyTitle="داده‌ای موجود نیست">
          {d.topProducts.map((p, i) => (
            <Tr key={i}>
              <Td>
                <span className="ml-2 inline-flex size-5 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">{faDigits(i + 1)}</span>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100">{p.title}</span>
              </Td>
              <Td>{faDigits(p.units)}</Td>
              <Td className="font-bold text-emerald-600">{formatPrice(p.revenue)}</Td>
            </Tr>
          ))}
        </DataTable>
      </div>
    </div>
  );
}
