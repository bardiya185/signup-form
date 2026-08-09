'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { Box, Pencil } from 'lucide-react';
import { PanelTitle } from '@/components/admin/panel-shell';
import { DataTable, FilterPills, Pagination, TableToolbar, Td, Tr } from '@/components/admin/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { PageLoading } from '@/components/ui/states';
import { useAdjustStock, useWarehouseInventory } from '@/hooks/admin';
import type { WarehouseVariantRow } from '@/types/admin';
import { firstError } from '@/lib/http';
import { faDigits, formatPrice } from '@/lib/format';

const STATE_BADGE: Record<WarehouseVariantRow['status'], { tone: 'green' | 'amber' | 'red'; label: string }> = {
  in_stock: { tone: 'green', label: 'موجود' },
  low_stock: { tone: 'amber', label: 'کم‌موجودی' },
  out_of_stock: { tone: 'red', label: 'ناموجود' },
};

function InventoryInner() {
  const params = useSearchParams();
  const [state, setState] = useState(params.get('state') ?? '');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useWarehouseInventory({ q: q || undefined, state: state || undefined, page });
  const adjust = useAdjustStock();

  const [editing, setEditing] = useState<WarehouseVariantRow | null>(null);
  const [stock, setStock] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const openEdit = (v: WarehouseVariantRow) => {
    setEditing(v);
    setStock(String(v.stock));
    setReason('');
    setError('');
  };

  const submit = () => {
    if (!editing) return;
    adjust.mutate(
      { id: editing.variantId, stock: Number(stock) || 0, reason: reason.trim() || undefined },
      {
        onSuccess: () => setEditing(null),
        onError: (e: unknown) => setError(firstError(e) || 'خطا در به‌روزرسانی موجودی'),
      },
    );
  };

  return (
    <div className="space-y-6">
      <PanelTitle title="موجودی انبار" description={data ? `${faDigits(data.meta.total)} تنوع کالا در انبار` : 'مدیریت و اصلاح موجودی تنوع‌ها'} />
      <TableToolbar search={q} onSearch={(v) => { setQ(v); setPage(1); }} placeholder="جستجو در نام کالا یا SKU…">
        <FilterPills
          value={state || undefined}
          onChange={(v) => { setState(v ?? ''); setPage(1); }}
          allLabel="همه"
          options={[
            { value: 'in_stock', label: 'موجود' },
            { value: 'low_stock', label: 'کم‌موجودی' },
            { value: 'out_of_stock', label: 'ناموجود' },
          ]}
        />
      </TableToolbar>

      {isLoading || !data ? <PageLoading /> : (
        <>
          <DataTable head={['کالا / تنوع', 'SKU', 'قیمت', 'موجودی', 'وضعیت', '']} empty={data.data.length === 0} emptyTitle="تنوعی یافت نشد">
            {data.data.map((v) => (
              <Tr key={v.variantId}>
                <Td>
                  <div className="flex items-center gap-3">
                    {v.image
                      ? <img src={v.image} alt="" className="size-10 rounded-lg border border-zinc-100 object-cover dark:border-zinc-800" />
                      : <span className="flex size-10 items-center justify-center rounded-lg bg-zinc-100 text-zinc-400 dark:bg-zinc-800"><Box className="size-4" /></span>}
                    <div className="max-w-60">
                      <p className="truncate text-xs font-bold text-zinc-800 dark:text-zinc-100">{v.productTitle}</p>
                      <p className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                        {v.color && (
                          <span className="inline-flex items-center gap-1">
                            <span className="size-2.5 rounded-full border border-zinc-200" style={{ backgroundColor: v.color.hex_code }} />
                            {v.color.name}
                          </span>
                        )}
                        {v.guarantee && <span> / {v.guarantee}</span>}
                        {!v.isActive && <Badge tone="zinc">غیرفعال</Badge>}
                      </p>
                    </div>
                  </div>
                </Td>
                <Td><span dir="ltr" className="text-[10px] text-zinc-400">{v.sku}</span></Td>
                <Td className="text-xs">{formatPrice(v.salePrice ?? v.price)}</Td>
                <Td>
                  <span className={v.stock === 0 ? 'font-black text-rose-600' : v.status === 'low_stock' ? 'font-black text-amber-600' : 'font-bold'}>
                    {faDigits(v.stock)}
                  </span>
                </Td>
                <Td><Badge tone={STATE_BADGE[v.status].tone}>{STATE_BADGE[v.status].label}</Badge></Td>
                <Td>
                  <Button size="sm" variant="outline" onClick={() => openEdit(v)}>
                    <Pencil className="h-3.5 w-3.5" /> اصلاح موجودی
                  </Button>
                </Td>
              </Tr>
            ))}
          </DataTable>
          <Pagination page={data.meta.current_page} lastPage={data.meta.last_page} onChange={setPage} />
        </>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={`اصلاح موجودی «${editing?.productTitle ?? ''}»`} size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditing(null)}>انصراف</Button>
            <Button onClick={submit} loading={adjust.isPending} className="!bg-amber-500 hover:!bg-amber-600">ثبت اصلاحیه</Button>
          </>
        }>
        <div className="space-y-4">
          <p className="rounded-xl bg-zinc-50 p-3 text-[11px] leading-5 text-zinc-500 dark:bg-zinc-800/60 dark:text-zinc-400">
            موجودی فعلی: <b className="text-zinc-800 dark:text-zinc-100">{faDigits(editing?.stock ?? 0)}</b> واحد
            {editing?.color && <> — {editing.color.name}</>}
            {stock !== '' && editing && Number(stock) !== editing.stock && (
              <span className={Number(stock) > editing.stock ? 'mr-2 font-bold text-emerald-600' : 'mr-2 font-bold text-rose-500'}>
                ({Number(stock) > editing.stock ? '+' : ''}{faDigits(Number(stock) - editing.stock)})
              </span>
            )}
          </p>
          <Field label="موجودی جدید" required>
            <Input inputMode="numeric" dir="ltr" value={stock} onChange={(e) => setStock(e.target.value.replace(/\D/g, ''))} />
          </Field>
          <Field label="دلیل اصلاح" hint="مثلاً: شمارش فیزیکی، برگشت از مشتری، مغایرت انبار">
            <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="دلیل تغییر موجودی…" />
          </Field>
          <p className="text-[10px] leading-5 text-zinc-400">این تغییر در «گردش موجودی» ثبت می‌شود و قابل ردیابی است.</p>
          {error && <p className="text-xs font-bold text-rose-600">{error}</p>}
        </div>
      </Modal>
    </div>
  );
}

export default function WarehouseInventoryPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <InventoryInner />
    </Suspense>
  );
}
