'use client';
/**
 * لاگ فعالیت — رخدادهای مدیریتی سیستم (جدیدترین اول)
 */
import { useState } from 'react';
import { useAdminLogs } from '@/hooks/admin';
import { PanelTitle } from '@/components/admin/panel-shell';
import { DataTable, Pagination, Td, Tr } from '@/components/admin/data-table';
import { Badge } from '@/components/ui/badge';
import { faDigits, jdatetime } from '@/lib/format';

const ACTION_GROUP: Record<string, { tone: 'green' | 'blue' | 'amber' | 'red' | 'purple' | 'zinc'; label: string }> = {
  product: { tone: 'blue', label: 'محصول' },
  category: { tone: 'blue', label: 'دسته' },
  brand: { tone: 'blue', label: 'برند' },
  coupon: { tone: 'purple', label: 'کوپن' },
  offer: { tone: 'purple', label: 'پیشنهاد' },
  banner: { tone: 'purple', label: 'بنر' },
  seller: { tone: 'amber', label: 'فروشنده' },
  user: { tone: 'amber', label: 'کاربر' },
  review: { tone: 'green', label: 'دیدگاه' },
  order: { tone: 'green', label: 'سفارش' },
  warehouse: { tone: 'zinc', label: 'انبار' },
  settings: { tone: 'red', label: 'تنظیمات' },
  auth: { tone: 'zinc', label: 'احراز' },
  system: { tone: 'zinc', label: 'سیستم' },
};

const groupOf = (action: string) => ACTION_GROUP[action.split('.')[0]] ?? { tone: 'zinc' as const, label: action.split('.')[0] };

export default function AdminLogsPage() {
  const [page, setPage] = useState(1);
  const logs = useAdminLogs(page);
  const rows = logs.data?.data ?? [];
  const meta = logs.data?.meta;

  return (
    <div>
      <PanelTitle title="لاگ فعالیت" description={`${faDigits(meta?.total ?? 0)} رخداد ثبت شده`} />

      <DataTable
        head={['رویداد', 'شرح', 'عامل', 'زمان']}
        loading={logs.isLoading}
        empty={rows.length === 0}
      >
        {rows.map((l) => {
          const g = groupOf(l.action);
          return (
            <Tr key={l.id}>
              <Td>
                <div className="flex items-center gap-2">
                  <Badge tone={g.tone}>{g.label}</Badge>
                  <span className="font-mono text-[11px] text-zinc-500" dir="ltr">{l.action}</span>
                </div>
              </Td>
              <Td className="max-w-80">
                <span className="line-clamp-1 text-zinc-600 dark:text-zinc-300">{l.description ?? '—'}</span>
              </Td>
              <Td className="whitespace-nowrap">{l.actorName}</Td>
              <Td className="whitespace-nowrap text-zinc-400">{jdatetime(l.createdAt)}</Td>
            </Tr>
          );
        })}
      </DataTable>

      {meta && <Pagination page={meta.current_page} lastPage={meta.last_page} onChange={setPage} />}
    </div>
  );
}
