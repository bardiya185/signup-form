'use client';
import { useMemo, useState } from 'react';
import { PanelTitle } from '@/components/admin/panel-shell';
import { DataTable, FilterPills, Td, Tr } from '@/components/admin/data-table';
import { Badge } from '@/components/ui/badge';
import { PageLoading } from '@/components/ui/states';
import { useSellerOrders } from '@/hooks/admin';
import { faDigits, formatPrice, jdate } from '@/lib/format';

const STATUS_TONE: Record<string, 'amber' | 'blue' | 'purple' | 'green' | 'red' | 'zinc'> = {
  pending: 'amber', paid: 'blue', processing: 'blue', shipped: 'purple', delivered: 'green', cancelled: 'red', refunded: 'zinc',
};
const STATUS_FA: Record<string, string> = {
  pending: 'در انتظار پرداخت', paid: 'پرداخت‌شده', processing: 'در حال پردازش', shipped: 'ارسال‌شده', delivered: 'تحویل‌شده', cancelled: 'لغوشده', refunded: 'مرجوع‌شده',
};

export default function SellerOrdersPage() {
  const { data, isLoading } = useSellerOrders();
  const [state, setState] = useState('');
  const rows = useMemo(() => data?.data ?? [], [data]);
  const filtered = state ? rows.filter((r) => r.orderStatus === state) : rows;

  if (isLoading || !data) return <PageLoading />;

  return (
    <div className="space-y-6">
      <PanelTitle title="سفارش‌های مرتبط" description={`${faDigits(rows.length)} قلم از سفارش‌های مشتریان شامل کالای شماست`} />
      <FilterPills
        value={state || undefined}
        onChange={(v) => setState(v ?? '')}
        allLabel={`همه (${faDigits(rows.length)})`}
        options={[
          { value: 'processing', label: 'در حال پردازش' },
          { value: 'shipped', label: 'ارسال‌شده' },
          { value: 'delivered', label: 'تحویل‌شده' },
          { value: 'cancelled', label: 'لغوشده' },
        ]}
      />
      <DataTable
        head={['شماره سفارش', 'کالای شما', 'تعداد', 'فی', 'مبلغ', 'خریدار', 'وضعیت', 'تاریخ']}
        empty={filtered.length === 0}
        emptyTitle="سفارشی با این وضعیت یافت نشد"
      >
        {filtered.map((o) => (
          <Tr key={o.id}>
            <Td className="font-bold text-zinc-800 dark:text-zinc-100">{faDigits(o.orderNumber)}</Td>
            <Td>
              <div className="max-w-64">
                <p className="truncate text-xs font-bold text-zinc-800 dark:text-zinc-100">{o.itemTitle}</p>
                {o.variantInfo && (
                  <p className="text-[10px] text-zinc-400">
                    {[o.variantInfo.color, o.variantInfo.size && `سایز ${o.variantInfo.size}`, o.variantInfo.guarantee].filter(Boolean).join(' / ')}
                  </p>
                )}
              </div>
            </Td>
            <Td>{faDigits(o.quantity)}</Td>
            <Td className="text-xs">{formatPrice(o.unitPrice)}</Td>
            <Td className="font-bold text-emerald-600">{formatPrice(o.total)}</Td>
            <Td className="text-xs">{o.buyer}</Td>
            <Td><Badge tone={STATUS_TONE[o.orderStatus] ?? 'zinc'}>{STATUS_FA[o.orderStatus] ?? o.orderStatus}</Badge></Td>
            <Td className="text-xs">{jdate(o.createdAt)}</Td>
          </Tr>
        ))}
      </DataTable>
    </div>
  );
}
