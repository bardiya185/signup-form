'use client';
import Link from 'next/link';
import { ArrowLeftRight, Box, Boxes, PackageX, Send, Truck, Wallet } from 'lucide-react';
import { PanelTitle } from '@/components/admin/panel-shell';
import { StatsCard } from '@/components/admin/stats-card';
import { DataTable, Td, Tr } from '@/components/admin/data-table';
import { Badge } from '@/components/ui/badge';
import { PageLoading } from '@/components/ui/states';
import { useWarehouseDashboard } from '@/hooks/admin';
import { faDigits, jdate, timeAgo } from '@/lib/format';

const stockBadge = (stock: number) =>
  stock === 0 ? <Badge tone="red">ناموجود</Badge> : <Badge tone="amber">{faDigits(stock)} عدد</Badge>;

export default function WarehouseDashboardPage() {
  const { data, isLoading } = useWarehouseDashboard();
  if (isLoading || !data) return <PageLoading />;
  const d = data.data;
  const s = d.stats;

  return (
    <div className="space-y-6">
      <PanelTitle title="پیشخوان انبار" description="وضعیت لحظه‌ای موجودی و مرسوله‌ها (به‌روزرسانی خودکار هر دقیقه)" />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatsCard icon={Truck} label="مرسوله‌های در انتظار ارسال" value={s.pendingShipments} tone="bg-amber-50 text-amber-600 dark:bg-amber-500/15" />
        <StatsCard icon={Send} label="ارسال‌شده در ۷ روز گذشته" value={s.shippedThisWeek} tone="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15" />
        <StatsCard icon={PackageX} label="اقلام کم‌موجودی" value={s.lowStockCount} tone="bg-rose-50 text-rose-500 dark:bg-rose-500/15" />
        <StatsCard icon={PackageX} label="اقلام ناموجود" value={s.outOfStockCount} tone="bg-zinc-100 text-zinc-500 dark:bg-zinc-500/15" />
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatsCard icon={Boxes} label="تنوع‌های انبار" value={s.totalVariants} tone="bg-sky-50 text-sky-600 dark:bg-sky-500/15" />
        <StatsCard icon={Box} label="مجموع واحدهای موجود" value={s.totalStockUnits} tone="bg-teal-50 text-teal-600 dark:bg-teal-500/15" />
        <StatsCard icon={Wallet} label="ارزش موجودی انبار" value={s.stockValue} isPrice tone="bg-violet-50 text-violet-600 dark:bg-violet-500/15" />
        <StatsCard icon={ArrowLeftRight} label="گردش‌های امروز" value={s.movementsToday} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-zinc-800 dark:text-zinc-100">هشدار کم‌موجودی</h2>
            <Link href="/warehouse/inventory?state=low_stock" className="text-xs font-bold text-amber-600 hover:underline">مشاهده همه</Link>
          </div>
          <DataTable head={['کالا', 'SKU', 'موجودی']} empty={d.lowStock.length === 0} emptyTitle="مورد کم‌موجودی نیست 🎉">
            {d.lowStock.map((v) => (
              <Tr key={v.variantId}>
                <Td className="max-w-44 truncate text-xs font-bold text-zinc-800 dark:text-zinc-100">{v.productTitle}</Td>
                <Td><span dir="ltr" className="text-[10px] text-zinc-400">{v.sku}</span></Td>
                <Td>{stockBadge(v.stock)}</Td>
              </Tr>
            ))}
          </DataTable>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-zinc-800 dark:text-zinc-100">آماده ارسال</h2>
            <Link href="/warehouse/shipments" className="text-xs font-bold text-amber-600 hover:underline">رفتن به مرسوله‌ها</Link>
          </div>
          <DataTable head={['سفارش', 'خریدار', 'اقلام', 'زمان ثبت']} empty={d.readyShipments.length === 0} emptyTitle="مرسوله آماده ارسالی نیست">
            {d.readyShipments.map((o) => (
              <Tr key={o.id}>
                <Td className="font-bold text-zinc-800 dark:text-zinc-100">{faDigits(o.orderNumber)}</Td>
                <Td className="text-xs">{o.buyer}</Td>
                <Td>{faDigits(o.itemsCount)} قلم</Td>
                <Td className="text-xs">{timeAgo(o.createdAt)}</Td>
              </Tr>
            ))}
          </DataTable>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-zinc-800 dark:text-zinc-100">آخرین گردش‌های موجودی</h2>
          <Link href="/warehouse/movements" className="text-xs font-bold text-amber-600 hover:underline">همه گردش‌ها</Link>
        </div>
        <DataTable head={['کالا', 'تغییر', 'از → به', 'دلیل', 'توسط', 'زمان']} empty={d.recentMovements.length === 0} emptyTitle="گردشی ثبت نشده است">
          {d.recentMovements.map((m) => (
            <Tr key={m.id}>
              <Td className="max-w-44 truncate text-xs font-bold text-zinc-800 dark:text-zinc-100">{m.productTitle}</Td>
              <Td>
                <span className={m.delta > 0 ? 'font-black text-emerald-600' : 'font-black text-rose-500'}>
                  {m.delta > 0 ? `+${faDigits(m.delta)}` : faDigits(m.delta)}
                </span>
              </Td>
              <Td className="text-xs">{faDigits(m.oldStock)} ← {faDigits(m.newStock)}</Td>
              <Td className="text-xs">{m.reason || '—'}</Td>
              <Td className="text-xs">{m.changedBy}</Td>
              <Td className="text-xs">{jdate(m.createdAt, 'medium')}</Td>
            </Tr>
          ))}
        </DataTable>
      </div>
    </div>
  );
}
