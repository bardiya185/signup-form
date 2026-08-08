'use client';
import { useMemo, useState } from 'react';
import { CheckCircle2, Clock, Wallet } from 'lucide-react';
import { PanelTitle } from '@/components/admin/panel-shell';
import { StatsCard } from '@/components/admin/stats-card';
import { DataTable, FilterPills, Td, Tr } from '@/components/admin/data-table';
import { Badge } from '@/components/ui/badge';
import { PageLoading } from '@/components/ui/states';
import { useSellerSettlements } from '@/hooks/admin';
import { formatPrice, jdate } from '@/lib/format';

export default function SellerSettlementsPage() {
  const { data, isLoading } = useSellerSettlements();
  const [state, setState] = useState('');
  const rows = useMemo(() => data?.data ?? [], [data]);
  const filtered = state ? rows.filter((r) => r.status === state) : rows;
  const paid = rows.filter((r) => r.status === 'paid').reduce((a, r) => a + r.amount, 0);
  const pending = rows.filter((r) => r.status === 'pending').reduce((a, r) => a + r.amount, 0);

  if (isLoading || !data) return <PageLoading />;

  return (
    <div className="space-y-6">
      <PanelTitle title="تسویه‌حساب‌ها" description="سوابق تسویه فروش شما با گینان‌کالا" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatsCard icon={CheckCircle2} label="مجموع تسویه‌شده" value={paid} isPrice tone="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15" />
        <StatsCard icon={Clock} label="در انتظار تسویه" value={pending} isPrice tone="bg-amber-50 text-amber-600 dark:bg-amber-500/15" />
        <StatsCard icon={Wallet} label="تعداد تسویه‌ها" value={rows.length} tone="bg-sky-50 text-sky-600 dark:bg-sky-500/15" />
      </div>
      <FilterPills
        value={state || undefined}
        onChange={(v) => setState(v ?? '')}
        allLabel="همه"
        options={[
          { value: 'pending', label: 'در انتظار' },
          { value: 'paid', label: 'تسویه‌شده' },
        ]}
      />
      <DataTable head={['مبلغ', 'وضعیت', 'کد پیگیری', 'تاریخ ثبت', 'تاریخ پرداخت']} empty={filtered.length === 0} emptyTitle="تسویه‌حسابی یافت نشد">
        {filtered.map((r) => (
          <Tr key={r.id}>
            <Td className="font-bold text-zinc-800 dark:text-zinc-100">{formatPrice(r.amount)}</Td>
            <Td><Badge tone={r.status === 'paid' ? 'green' : 'amber'}>{r.statusFa}</Badge></Td>
            <Td><span dir="ltr" className="text-xs text-zinc-500">{r.reference || '—'}</span></Td>
            <Td className="text-xs">{jdate(r.createdAt)}</Td>
            <Td className="text-xs">{r.paidAt ? jdate(r.paidAt) : '—'}</Td>
          </Tr>
        ))}
      </DataTable>
    </div>
  );
}
