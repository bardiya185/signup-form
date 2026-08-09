'use client';
/**
 * سفارش‌های ادمین — فیلتر وضعیت + جستجو
 */
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { Eye, ShoppingBag } from 'lucide-react';
import { useAdminOrders } from '@/hooks/admin';
import { PanelTitle } from '@/components/admin/panel-shell';
import { DataTable, FilterPills, Pagination, TableToolbar, Td, Tr } from '@/components/admin/data-table';
import { OrderStatusBadge } from '@/components/profile/order-bits';
import { Badge } from '@/components/ui/badge';
import { faDigits, formatPrice, jdatetime } from '@/lib/format';
import type { OrderStatus } from '@/types/account';

const STATUS_OPTS = [
  { value: 'pending', label: 'در انتظار پرداخت' },
  { value: 'processing', label: 'در حال پردازش' },
  { value: 'shipped', label: 'ارسال شده' },
  { value: 'delivered', label: 'تحویل شده' },
  { value: 'cancelled', label: 'لغو شده' },
  { value: 'returned', label: 'مرجوع شده' },
];

function OrdersInner() {
  const [status, setStatus] = useState<string | undefined>();
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const orders = useAdminOrders({ status, q: q || undefined, page });

  const rows = orders.data?.data ?? [];

  return (
    <div>
      <PanelTitle title="مدیریت سفارش‌ها" description={`${faDigits(orders.data?.meta.total ?? 0)} سفارش`} />

      <TableToolbar search={q} onSearch={(v) => { setQ(v); setPage(1); }} placeholder="شماره سفارش یا نام خریدار…">
        <FilterPills options={STATUS_OPTS} value={status} onChange={(v) => { setStatus(v); setPage(1); }} />
      </TableToolbar>

      <DataTable
        head={['شماره سفارش', 'خریدار', 'کالا', 'مبلغ (تومان)', 'پرداخت', 'وضعیت', 'تاریخ', '']}
        loading={orders.isLoading}
        empty={rows.length === 0}
      >
        {rows.map((o) => (
          <Tr key={o.id}>
            <Td className="font-mono font-bold text-zinc-800 dark:text-zinc-100" dir="ltr">{o.orderNumber}</Td>
            <Td>{o.buyerName}</Td>
            <Td>{faDigits(o.itemsCount)} کالا</Td>
            <Td className="font-black text-zinc-800 dark:text-zinc-100">{formatPrice(o.totalAmount)}</Td>
            <Td>
              <Badge tone={o.paymentStatus === 'paid' ? 'green' : o.paymentStatus === 'refunded' ? 'purple' : o.paymentStatus === 'failed' ? 'red' : 'amber'}>
                {o.paymentStatusFa}
              </Badge>
            </Td>
            <Td><OrderStatusBadge status={o.status as OrderStatus} label={o.statusFa} /></Td>
            <Td className="text-zinc-400">{jdatetime(o.createdAt)}</Td>
            <Td>
              <Link
                href={`/admin/orders/${o.id}`}
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-sky-600 transition hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-sky-500/10"
              >
                <Eye size={14} /> جزئیات
              </Link>
            </Td>
          </Tr>
        ))}
      </DataTable>

      {orders.data && <Pagination page={page} lastPage={orders.data.meta.last_page} onChange={setPage} />}
    </div>
  );
}

export default function AdminOrdersPage() {
  return <Suspense><OrdersInner /></Suspense>;
}
