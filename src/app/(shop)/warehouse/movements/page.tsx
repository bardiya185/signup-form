'use client';
import { useState } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { PanelTitle } from '@/components/admin/panel-shell';
import { DataTable, Pagination, Td, Tr } from '@/components/admin/data-table';
import { PageLoading } from '@/components/ui/states';
import { useWarehouseMovements } from '@/hooks/admin';
import { faDigits, jdatetime } from '@/lib/format';

export default function WarehouseMovementsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useWarehouseMovements(page);
  if (isLoading || !data) return <PageLoading />;

  return (
    <div className="space-y-6">
      <PanelTitle title="گردش موجودی" description="تمام ورود و خروج‌های دستی و سیستمی انبار" />
      <DataTable head={['کالا', 'SKU', 'تغییر', 'موجودی قبل', 'موجودی بعد', 'دلیل', 'ثبت‌کننده', 'زمان']} empty={data.data.length === 0} emptyTitle="گردشی ثبت نشده است">
        {data.data.map((m) => (
          <Tr key={m.id}>
            <Td className="max-w-52 truncate text-xs font-bold text-zinc-800 dark:text-zinc-100">{m.productTitle}</Td>
            <Td><span dir="ltr" className="text-[10px] text-zinc-400">{m.sku}</span></Td>
            <Td>
              <span className={`inline-flex items-center gap-1 font-black ${m.delta > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                {m.delta > 0 ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
                {m.delta > 0 ? `+${faDigits(m.delta)}` : faDigits(m.delta)}
              </span>
            </Td>
            <Td>{faDigits(m.oldStock)}</Td>
            <Td className="font-bold">{faDigits(m.newStock)}</Td>
            <Td className="max-w-44 truncate text-xs">{m.reason || '—'}</Td>
            <Td className="text-xs">{m.changedBy}</Td>
            <Td className="whitespace-nowrap text-xs">{jdatetime(m.createdAt)}</Td>
          </Tr>
        ))}
      </DataTable>
      <Pagination page={data.meta.current_page} lastPage={data.meta.last_page} onChange={setPage} />
    </div>
  );
}
