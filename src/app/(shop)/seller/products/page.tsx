'use client';
import Link from 'next/link';
import { useState } from 'react';
import { PackagePlus, Pencil } from 'lucide-react';
import { PanelTitle } from '@/components/admin/panel-shell';
import { DataTable, Pagination, Td, Tr } from '@/components/admin/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { PageLoading } from '@/components/ui/states';
import { useSellerProductMutations, useSellerProducts } from '@/hooks/admin';
import type { SellerProductRow } from '@/types/admin';
import { firstError } from '@/lib/http';
import { faDigits, formatPrice, jdate } from '@/lib/format';

const STATUS_TONE: Record<string, 'green' | 'amber' | 'zinc'> = { active: 'green', pending_review: 'amber', inactive: 'zinc' };
const STATUS_FA: Record<string, string> = { active: 'فعال', pending_review: 'در انتظار بررسی', inactive: 'غیرفعال' };

export default function SellerProductsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useSellerProducts(page);
  const mut = useSellerProductMutations();
  const [editing, setEditing] = useState<SellerProductRow | null>(null);
  const [price, setPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [stock, setStock] = useState('');
  const [error, setError] = useState('');

  if (isLoading || !data) return <PageLoading />;
  const rows = data.data;

  const openEdit = (p: SellerProductRow) => {
    setEditing(p);
    setPrice(String(p.price));
    setSalePrice(p.effectivePrice !== p.price ? String(p.effectivePrice) : '');
    setStock(String(p.stock));
    setError('');
  };

  const submit = () => {
    if (!editing) return;
    const payload: { id: number; price: number; stock: number; sale_price?: number | null } = {
      id: editing.id,
      price: Number(price) || 0,
      stock: Number(stock) || 0,
    };
    if (salePrice.trim()) payload.sale_price = Number(salePrice);
    mut.update.mutate(payload, {
      onSuccess: () => setEditing(null),
      onError: (e: unknown) => setError(firstError(e) || 'خطا در ویرایش کالا'),
    });
  };

  return (
    <div className="space-y-6">
      <PanelTitle
        title="کالاهای من"
        description={`${faDigits(data.meta.total)} کالا در فروشگاه شما`}
        action={
          <Link href="/seller/products/new" className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700">
            <PackagePlus className="h-4 w-4" /> ثبت کالای جدید
          </Link>
        }
      />
      <DataTable
        head={['کالا', 'قیمت', 'موجودی', 'امتیاز', 'وضعیت', 'تاریخ ثبت', '']}
        empty={rows.length === 0}
        emptyTitle="هنوز کالایی ثبت نکرده‌اید"
      >
        {rows.map((p) => (
          <Tr key={p.id}>
            <Td>
              <div className="flex items-center gap-3">
                <img src={p.image} alt="" className="size-10 rounded-lg border border-zinc-100 object-cover dark:border-zinc-800" />
                <div className="max-w-56">
                  <p className="truncate text-xs font-bold text-zinc-800 dark:text-zinc-100">{p.title}</p>
                  <p className="text-[10px] text-zinc-400">{faDigits(p.slug)}</p>
                </div>
              </div>
            </Td>
            <Td>
              <div className="leading-5">
                {p.discountPercent > 0 && <span className="ml-2 rounded bg-rose-100 px-1 text-[10px] font-bold text-rose-600">{faDigits(p.discountPercent)}٪</span>}
                <span className="font-bold text-zinc-800 dark:text-zinc-100">{formatPrice(p.effectivePrice)}</span>
                {p.effectivePrice !== p.price && <span className="block text-[10px] text-zinc-400 line-through">{formatPrice(p.price)}</span>}
              </div>
            </Td>
            <Td>
              <span className={p.stock === 0 ? 'font-bold text-rose-600' : p.stock < 6 ? 'font-bold text-amber-600' : ''}>{faDigits(p.stock)}</span>
            </Td>
            <Td>{faDigits(p.rating)} <span className="text-[10px] text-zinc-400">({faDigits(p.reviewCount)})</span></Td>
            <Td><Badge tone={STATUS_TONE[p.status] ?? 'zinc'}>{STATUS_FA[p.status] ?? p.status}</Badge></Td>
            <Td className="text-xs">{p.createdAt ? jdate(p.createdAt) : '—'}</Td>
            <Td>
              <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                <Pencil className="h-3.5 w-3.5" /> ویرایش
              </Button>
            </Td>
          </Tr>
        ))}
      </DataTable>
      <Pagination page={data.meta.current_page} lastPage={data.meta.last_page} onChange={setPage} />

      <Modal open={!!editing} onClose={() => setEditing(null)} title={`ویرایش «${editing?.title ?? ''}»`} size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditing(null)}>انصراف</Button>
            <Button onClick={submit} loading={mut.update.isPending} className="!bg-emerald-600 hover:!bg-emerald-700">ذخیره تغییرات</Button>
          </>
        }>
        <div className="space-y-4">
          <Field label="قیمت اصلی (تومان)" required>
            <Input inputMode="numeric" dir="ltr" value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))} />
          </Field>
          <Field label="قیمت فروش (اختیاری)" hint="در صورت خالی بودن، با قیمت اصلی فروخته می‌شود">
            <Input inputMode="numeric" dir="ltr" value={salePrice} onChange={(e) => setSalePrice(e.target.value.replace(/\D/g, ''))} />
          </Field>
          <Field label="موجودی انبار" required>
            <Input inputMode="numeric" dir="ltr" value={stock} onChange={(e) => setStock(e.target.value.replace(/\D/g, ''))} />
          </Field>
          {editing?.status === 'pending_review' && (
            <p className="rounded-xl bg-amber-50 p-3 text-[11px] leading-5 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
              پس از ویرایش، کالا دوباره در وضعیت «در انتظار بررسی» قرار می‌گیرد تا توسط مدیریت تأیید شود.
            </p>
          )}
          {error && <p className="text-xs font-bold text-rose-600">{error}</p>}
        </div>
      </Modal>
    </div>
  );
}
