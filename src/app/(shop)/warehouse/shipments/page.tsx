'use client';
import { useState } from 'react';
import { MapPin, Send } from 'lucide-react';
import { PanelTitle } from '@/components/admin/panel-shell';
import { DataTable, FilterPills, Pagination, Td, Tr } from '@/components/admin/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/modal';
import { PageLoading } from '@/components/ui/states';
import { useShipOrder, useWarehouseShipments } from '@/hooks/admin';
import type { ShipmentRow } from '@/types/admin';
import { faDigits, formatPrice, jdate, jdatetime } from '@/lib/format';

export default function WarehouseShipmentsPage() {
  const [tab, setTab] = useState<'ready' | 'shipped'>('ready');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useWarehouseShipments(tab, page);
  const ship = useShipOrder();
  const [target, setTarget] = useState<ShipmentRow | null>(null);

  if (isLoading || !data) return <PageLoading />;

  return (
    <div className="space-y-6">
      <PanelTitle title="مرسوله‌ها" description={tab === 'ready' ? 'سفارش‌های پرداخت‌شده‌ای که آماده خروج از انبارند' : 'سوابق مرسوله‌های ارسال‌شده'} />
      <FilterPills
        value={tab}
        onChange={(v) => { setTab((v as 'ready' | 'shipped') ?? 'ready'); setPage(1); }}
        allLabel="آماده ارسال"
        options={[{ value: 'shipped', label: 'ارسال‌شده' }]}
      />
      <DataTable
        head={tab === 'ready'
          ? ['سفارش', 'اقلام', 'خریدار / مقصد', 'مبلغ', 'زمان ثبت', '']
          : ['سفارش', 'اقلام', 'خریدار / مقصد', 'مبلغ', 'زمان ارسال', 'وضعیت']}
        empty={data.data.length === 0}
        emptyTitle={tab === 'ready' ? 'مرسوله‌ای در صف ارسال نیست 🎉' : 'هنوز مرسوله‌ای ارسال نشده است'}
      >
        {data.data.map((o) => (
          <Tr key={o.id}>
            <Td className="font-bold text-zinc-800 dark:text-zinc-100">{faDigits(o.orderNumber)}</Td>
            <Td>
              <ul className="space-y-1">
                {o.items.slice(0, 3).map((it) => (
                  <li key={it.id} className="text-xs leading-5">
                    <span className="font-bold text-zinc-700 dark:text-zinc-200">{it.title}</span>
                    {it.variantInfo && (
                      <span className="mr-1 text-zinc-400">
                        {[it.variantInfo.color, it.variantInfo.size && `سایز ${it.variantInfo.size}`].filter(Boolean).join(' / ')}
                      </span>
                    )}
                    <span className="mr-1 rounded bg-zinc-100 px-1 text-[10px] dark:bg-zinc-800">×{faDigits(it.quantity)}</span>
                  </li>
                ))}
                {o.items.length > 3 && <li className="text-[10px] text-zinc-400">+ {faDigits(o.items.length - 3)} قلم دیگر</li>}
              </ul>
            </Td>
            <Td>
              <p className="text-xs font-bold text-zinc-700 dark:text-zinc-200">{o.buyer}</p>
              <p className="mt-0.5 flex max-w-52 items-start gap-1 truncate text-[10px] text-zinc-400">
                <MapPin className="mt-0.5 size-3 shrink-0" /> {o.destination}
              </p>
            </Td>
            <Td className="font-bold text-zinc-800 dark:text-zinc-100">{formatPrice(o.total)}</Td>
            {tab === 'ready' ? (
              <>
                <Td className="text-xs">{jdate(o.createdAt)}</Td>
                <Td>
                  <Button size="sm" onClick={() => setTarget(o)} className="!bg-amber-500 hover:!bg-amber-600">
                    <Send className="h-3.5 w-3.5" /> خروج از انبار
                  </Button>
                </Td>
              </>
            ) : (
              <>
                <Td className="text-xs">{o.shippedAt ? jdatetime(o.shippedAt) : '—'}</Td>
                <Td><Badge tone={o.status === 'delivered' ? 'green' : 'purple'}>{o.statusFa}</Badge></Td>
              </>
            )}
          </Tr>
        ))}
      </DataTable>
      <Pagination page={data.meta.current_page} lastPage={data.meta.last_page} onChange={setPage} />

      <ConfirmDialog
        open={!!target}
        onClose={() => setTarget(null)}
        onConfirm={() => ship.mutate(target!.id, { onSuccess: () => setTarget(null) })}
        title="خروج مرسوله از انبار"
        message={`سفارش ${target ? faDigits(target.orderNumber) : ''} (${target ? faDigits(target.itemsCount) : ''} قلم) به‌عنوان ارسال‌شده ثبت شود؟ موجودی مربوطه قبلاً هنگام پرداخت رزرو شده است.`}
        confirmText="بله، ارسال شد 📦"
        loading={ship.isPending}
      />
    </div>
  );
}
