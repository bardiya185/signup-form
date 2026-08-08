'use client';
/**
 * پرداخت‌ها — فیلتر وضعیت/روش + جدول تراکنش‌ها
 */
import { useState } from 'react';
import { Wallet } from 'lucide-react';
import { useAdminPayments } from '@/hooks/admin';
import { PanelTitle } from '@/components/admin/panel-shell';
import { DataTable, FilterPills, Pagination, TableToolbar, Td, Tr } from '@/components/admin/data-table';
import { Badge } from '@/components/ui/badge';
import { faDigits, formatPrice, jdatetime } from '@/lib/format';

const statusTone = (s: string) => (s === 'success' ? 'green' : s === 'pending' ? 'amber' : s === 'refunded' ? 'blue' : 'red') as const;

export default function AdminPaymentsPage() {
  const [status, setStatus] = useState<string | undefined>();
  const [method, setMethod] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const payments = useAdminPayments({ status, method, page });
  const rows = payments.data?.data ?? [];
  const meta = payments.data?.meta;

  return (
    <div>
      <PanelTitle title="تراکنش‌های پرداخت" description={`${faDigits(meta?.total ?? 0)} تراکنش`} />

      <TableToolbar>
        <FilterPills
          options={[
            { value: 'success', label: 'موفق' }, { value: 'pending', label: 'در انتظار' },
            { value: 'failed', label: 'ناموفق' }, { value: 'refunded', label: 'بازگشت وجه' },
          ]}
          value={status}
          onChange={(v) => { setStatus(v); setPage(1); }}
          allLabel="همه وضعیت‌ها"
        />
        <FilterPills
          options={[
            { value: 'zarinpal', label: 'زرین‌پال' }, { value: 'mellat', label: 'ملت' },
            { value: 'saman', label: 'سامان' }, { value: 'wallet', label: 'کیف پول' },
          ]}
          value={method}
          onChange={(v) => { setMethod(v); setPage(1); }}
          allLabel="همه روش‌ها"
        />
      </TableToolbar>

      <DataTable
        head={['شناسه تراکنش', 'سفارش', 'روش', 'مبلغ', 'وضعیت', 'کد رهگیری', 'زمان']}
        loading={payments.isLoading}
        empty={rows.length === 0}
      >
        {rows.map((p) => (
          <Tr key={p.id}>
            <Td dir="ltr" className="font-mono text-[11px] text-zinc-500">{p.transactionId}</Td>
            <Td>
              {p.isWalletCharge ? (
                <span className="inline-flex items-center gap-1 text-xs text-violet-500"><Wallet size={13} /> شارژ کیف پول</span>
              ) : p.orderNumber ? (
                <span className="font-mono text-xs font-bold text-zinc-700 dark:text-zinc-200" dir="ltr">{p.orderNumber}</span>
              ) : '—'}
            </Td>
            <Td><Badge tone="blue">{p.methodFa}</Badge></Td>
            <Td className="font-black text-zinc-800 dark:text-zinc-100">{formatPrice(p.amount)}<span className="ms-1 text-[10px] font-normal text-zinc-400">تومان</span></Td>
            <Td><Badge tone={statusTone(p.status)}>{p.statusFa}</Badge></Td>
            <Td dir="ltr" className="font-mono text-[11px] text-zinc-400">{p.refNumber ?? '—'}</Td>
            <Td className="whitespace-nowrap text-zinc-400">{jdatetime(p.paidAt ?? p.createdAt)}</Td>
          </Tr>
        ))}
      </DataTable>

      {meta && <Pagination page={meta.current_page} lastPage={meta.last_page} onChange={setPage} />}
    </div>
  );
}
