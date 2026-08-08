'use client';
/**
 * تیکت‌های پشتیبانی — لیست با فیلتر وضعیت + ورود به گفتگو
 */
import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useAdminTickets } from '@/hooks/admin';
import { PanelTitle } from '@/components/admin/panel-shell';
import { DataTable, FilterPills, Pagination, TableToolbar, Td, Tr } from '@/components/admin/data-table';
import { Badge } from '@/components/ui/badge';
import { faDigits, jdate, jdatetime } from '@/lib/format';

const statusTone = (s: string) => (s === 'open' ? 'amber' : s === 'answered' ? 'green' : 'zinc') as const;
const priorityTone = (p: string) => (p === 'urgent' ? 'red' : p === 'high' ? 'amber' : 'zinc') as const;

export default function AdminTicketsPage() {
  const [status, setStatus] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const tickets = useAdminTickets(status, page);
  const rows = tickets.data?.data ?? [];
  const meta = tickets.data?.meta;

  return (
    <div>
      <PanelTitle title="تیکت‌های پشتیبانی" description={`${faDigits(meta?.total ?? 0)} تیکت`} />

      <TableToolbar>
        <FilterPills
          options={[
            { value: 'open', label: 'باز' }, { value: 'answered', label: 'پاسخ داده شده' }, { value: 'closed', label: 'بسته شده' },
          ]}
          value={status}
          onChange={(v) => { setStatus(v); setPage(1); }}
          allLabel="همه"
        />
      </TableToolbar>

      <DataTable
        head={['موضوع', 'کاربر', 'دپارتمان', 'اولویت', 'وضعیت', 'آخرین پیام', 'ثبت', '']}
        loading={tickets.isLoading}
        empty={rows.length === 0}
      >
        {rows.map((t) => (
          <Tr key={t.id}>
            <Td className="max-w-56 truncate font-bold text-zinc-800 dark:text-zinc-100">{t.subject}</Td>
            <Td>{t.requesterName}</Td>
            <Td><Badge tone="blue">{t.departmentFa}</Badge></Td>
            <Td><Badge tone={priorityTone(t.priority)}>{t.priorityFa}</Badge></Td>
            <Td><Badge tone={statusTone(t.status)}>{t.statusFa}</Badge></Td>
            <Td className="whitespace-nowrap text-zinc-400">{jdatetime(t.lastMessageAt)}</Td>
            <Td className="whitespace-nowrap text-zinc-400">{jdate(t.createdAt, 'medium')}</Td>
            <Td>
              <Link href={`/admin/tickets/${t.id}`} className="flex items-center gap-0.5 text-xs font-bold text-sky-600 hover:underline dark:text-sky-400">
                گفتگو <ChevronLeft size={13} />
              </Link>
            </Td>
          </Tr>
        ))}
      </DataTable>

      {meta && <Pagination page={meta.current_page} lastPage={meta.last_page} onChange={setPage} />}
    </div>
  );
}
