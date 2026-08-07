'use client';
/**
 * مدیریت محصولات — جدول با جستجو/فیلتر + ویرایش سریع (وضعیت، ویژه، قیمت، استوک) + حذف
 */
import { Suspense, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, PenLine, Plus, Star, Trash2 } from 'lucide-react';
import { useAdminProductMutations, useAdminProducts } from '@/hooks/admin';
import { PanelTitle } from '@/components/admin/panel-shell';
import { DataTable, FilterPills, Pagination, TableToolbar, Td, Tr } from '@/components/admin/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog, Modal } from '@/components/ui/modal';
import { Field, Input } from '@/components/ui/input';
import { faDigits, formatPrice } from '@/lib/format';
import { cn } from '@/utils/cn';
import type { AdminProductRow } from '@/types/admin';

const STATUS_OPTS = [
  { value: 'active', label: 'فعال' },
  { value: 'pending_review', label: 'در انتظار تایید' },
  { value: 'draft', label: 'پیش‌نویس' },
  { value: 'archived', label: 'بایگانی' },
];
const STATUS_FA: Record<string, string> = Object.fromEntries(STATUS_OPTS.map((s) => [s.value, s.label]));

const statusTone = (s: string) =>
  s === 'active' ? 'green' : s === 'pending_review' ? 'amber' : s === 'archived' ? 'zinc' : 'blue';

function ProductsInner() {
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get('q') ?? '');
  const [status, setStatus] = useState<string | undefined>(sp.get('status') ?? undefined);
  const [page, setPage] = useState(1);
  const products = useAdminProducts({ q: q || undefined, status, page });
  const mutations = useAdminProductMutations();
  const router = useRouter();

  const [editing, setEditing] = useState<AdminProductRow | null>(null);
  const [deleting, setDeleting] = useState<AdminProductRow | null>(null);
  const [form, setForm] = useState({ status: 'active', isFeatured: false, price: 0, salePrice: 0, stock: 0 });

  const openEdit = (row: AdminProductRow) => {
    setEditing(row);
    setForm({
      status: row.status,
      isFeatured: row.isFeatured,
      price: row.price,
      salePrice: 0,
      stock: row.stock,
    });
  };

  const rows = products.data?.data ?? [];

  return (
    <div>
      <PanelTitle
        title="مدیریت محصولات"
        description={`${faDigits(products.data?.meta.total ?? 0)} محصول در فروشگاه`}
        action={<Button onClick={() => router.push('/admin/products/new')}><Plus size={16} /> محصول جدید</Button>}
      />

      <TableToolbar search={q} onSearch={(v) => { setQ(v); setPage(1); }} placeholder="جستجو در عنوان یا SKU…">
        <FilterPills options={STATUS_OPTS} value={status} onChange={(v) => { setStatus(v); setPage(1); }} allLabel="همه وضعیت‌ها" />
      </TableToolbar>

      <DataTable
        head={['محصول', 'دسته / برند', 'قیمت (تومان)', 'موجودی', 'وضعیت', 'ویژه', 'بازدید', 'عملیات']}
        loading={products.isLoading}
        empty={rows.length === 0}
      >
        {rows.map((p) => (
          <Tr key={p.id}>
            <Td>
              <div className="flex items-center gap-3">
                {p.image && (
                  <span className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-zinc-50 dark:bg-zinc-800">
                    <Image src={p.image} alt={p.title} fill className="object-contain p-1" sizes="44px" />
                  </span>
                )}
                <div className="min-w-0 max-w-56">
                  <p className="truncate font-bold text-zinc-800 dark:text-zinc-100">{p.title}</p>
                  <p className="mt-0.5 font-mono text-[10px] text-zinc-400" dir="ltr">{p.sku}</p>
                </div>
              </div>
            </Td>
            <Td>
              <p>{p.categoryTitle ?? '—'}</p>
              <p className="text-[10px] text-zinc-400">{p.brandTitle ?? ''} {p.sellerTitle ? `• ${p.sellerTitle}` : ''}</p>
            </Td>
            <Td className="font-black text-zinc-800 dark:text-zinc-100">{formatPrice(p.price)}</Td>
            <Td>
              <Badge tone={p.stock === 0 ? 'red' : p.stock <= 3 ? 'amber' : 'green'}>{faDigits(p.stock)}</Badge>
            </Td>
            <Td><Badge tone={statusTone(p.status)}>{STATUS_FA[p.status] ?? p.status}</Badge></Td>
            <Td>{p.isFeatured ? <Star size={15} className="fill-amber-400 text-amber-400" /> : '—'}</Td>
            <Td>{faDigits(p.viewCount)}</Td>
            <Td>
              <div className="flex items-center gap-1">
                <Link href={`/products/${p.slug}`} target="_blank" className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800" title="مشاهده در فروشگاه">
                  <Eye size={15} />
                </Link>
                <button onClick={() => openEdit(p)} className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-sky-500/10" title="ویرایش سریع">
                  <PenLine size={15} />
                </button>
                <button onClick={() => setDeleting(p)} className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10" title="حذف">
                  <Trash2 size={15} />
                </button>
              </div>
            </Td>
          </Tr>
        ))}
      </DataTable>

      {products.data && <Pagination page={page} lastPage={products.data.meta.last_page} onChange={setPage} />}

      {/* ویرایش سریع */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title={`ویرایش سریع: ${editing?.title ?? ''}`} size="sm">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="وضعیت محصول">
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              >
                {STATUS_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
            <Field label="موجودی کل (تنوع اصلی)">
              <Input type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} dir="ltr" />
            </Field>
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-zinc-700 dark:text-zinc-200">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
              className="size-4 rounded accent-brand"
            />
            نمایش در «محصولات ویژه» صفحه اصلی
          </label>
          <p className="rounded-xl bg-zinc-50 p-3 text-[11px] leading-5 text-zinc-500 dark:bg-zinc-800/60 dark:text-zinc-400">
            تغییر قیمت و استوکِ دقیقِ هر تنوع از «پنل انبار → موجودی» یا ویرایش کامل محصول انجام می‌شود.
          </p>
          <Button
            className="w-full"
            loading={mutations.update.isPending}
            onClick={() => {
              if (!editing) return;
              mutations.update.mutate(
                { id: editing.id, status: form.status, is_featured: form.isFeatured },
                { onSuccess: () => setEditing(null) },
              );
            }}
          >
            ذخیره تغییرات
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => { if (deleting) mutations.remove.mutate(deleting.id); setDeleting(null); }}
        title="حذف محصول"
        message={`«${deleting?.title}» برای همیشه حذف می‌شود. مطمئن هستید؟`}
        confirmText="حذف کن"
        loading={mutations.remove.isPending}
      />
    </div>
  );
}

export default function AdminProductsPage() {
  return <Suspense><ProductsInner /></Suspense>;
}
