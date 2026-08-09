'use client';
/**
 * پیشنهادهای ویژه (شگفت‌انگیز) — لیست + ایجاد با انتخاب‌گر تنوع + فعال/غیرفعال + حذف
 */
import { useState } from 'react';
import { Flame, Plus, Trash2 } from 'lucide-react';
import { useAdminOfferMutations, useAdminOffers } from '@/hooks/admin';
import { PanelTitle } from '@/components/admin/panel-shell';
import { DataTable, Td, Tr } from '@/components/admin/data-table';
import { VariantPicker } from '@/components/admin/variant-picker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog, Modal } from '@/components/ui/modal';
import { Field, Input } from '@/components/ui/input';
import { faDigits, faPercent, formatPrice, jdatetime } from '@/lib/format';
import { toast } from '@/stores/ui.store';
import type { AdminOfferRow } from '@/types/admin';

const nowPlus = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString();

export default function AdminOffersPage() {
  const offers = useAdminOffers();
  const mutations = useAdminOfferMutations();
  const [modal, setModal] = useState(false);
  const [deleting, setDeleting] = useState<AdminOfferRow | null>(null);
  const [variantId, setVariantId] = useState<number | null>(null);
  const [picked, setPicked] = useState<{ title: string; price: number } | null>(null);
  const [discountPrice, setDiscountPrice] = useState<number>(0);
  const [stock, setStock] = useState(10);
  const [days, setDays] = useState(1);

  const rows = offers.data?.data ?? [];
  const pct = picked && discountPrice > 0 && discountPrice < picked.price
    ? Math.round(((picked.price - discountPrice) / picked.price) * 100) : 0;

  const reset = () => { setVariantId(null); setPicked(null); setDiscountPrice(0); setStock(10); setDays(1); };

  return (
    <div>
      <PanelTitle
        title="پیشنهادهای شگفت‌انگیز"
        description="آفرهای دارای تایمر در صفحه اصلی و صفحه شگفت‌انگیز"
        action={<Button onClick={() => { reset(); setModal(true); }}><Plus size={16} /> پیشنهاد جدید</Button>}
      />

      <DataTable
        head={['محصول / تنوع', 'قیمت آفر', 'تخفیف', 'موجودی', 'فروخته', 'انقضا', 'وضعیت', 'عملیات']}
        loading={offers.isLoading}
        empty={rows.length === 0}
      >
        {rows.map((o) => (
          <Tr key={o.id}>
            <Td>
              <p className="line-clamp-1 max-w-56 font-bold text-zinc-800 dark:text-zinc-100">{o.productTitle}</p>
              <p className="mt-0.5 font-mono text-[10px] text-zinc-400" dir="ltr">{o.variantSku}</p>
            </Td>
            <Td className="font-black text-brand">{formatPrice(o.discount_price)}</Td>
            <Td><Badge tone="brand">{faPercent(o.discount_percentage)}</Badge></Td>
            <Td>{faDigits(o.stock)}</Td>
            <Td>
              <div className="w-20">
                <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div className="h-full bg-brand" style={{ width: `${Math.min(100, Math.round((o.sold_count / Math.max(1, o.stock)) * 100))}%` }} />
                </div>
                <p className="mt-1 text-[10px] text-zinc-400">{faDigits(o.sold_count)}</p>
              </div>
            </Td>
            <Td className="text-zinc-400">{jdatetime(o.expires_at)}</Td>
            <Td>
              <button onClick={() => mutations.toggle.mutate({ id: o.id, is_active: !o.is_active })} disabled={mutations.toggle.isPending}>
                <Badge tone={o.is_active ? 'green' : 'zinc'}>{o.is_active ? 'فعال' : 'غیرفعال'}</Badge>
              </button>
            </Td>
            <Td>
              <button onClick={() => setDeleting(o)} className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10" title="حذف">
                <Trash2 size={15} />
              </button>
            </Td>
          </Tr>
        ))}
      </DataTable>

      {/* مودال ایجاد */}
      <Modal open={modal} onClose={() => setModal(false)} title="ایجاد پیشنهاد شگفت‌انگیز جدید">
        <div className="space-y-4">
          <Field label="انتخاب محصول و تنوع" required>
            <VariantPicker
              value={variantId}
              onChange={(id, title, price) => {
                setVariantId(id);
                setPicked({ title, price });
                setDiscountPrice(Math.round(price * 0.8));
              }}
            />
          </Field>

          {picked && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <Field label="قیمت آفر (تومان)" required>
                  <Input type="number" min={1000} step={1000} value={discountPrice} onChange={(e) => setDiscountPrice(Number(e.target.value))} dir="ltr" />
                </Field>
                <Field label="موجودی آفر">
                  <Input type="number" min={1} value={stock} onChange={(e) => setStock(Number(e.target.value))} dir="ltr" />
                </Field>
                <Field label="مدت (روز)">
                  <Input type="number" min={1} value={days} onChange={(e) => setDays(Number(e.target.value))} dir="ltr" />
                </Field>
              </div>
              <p className="rounded-xl bg-brand-soft p-3 text-center text-xs font-bold text-brand dark:bg-brand/15">
                قیمت اصلی: {formatPrice(picked.price)} — تخفیف محاسباتی: {faPercent(pct)}
                {discountPrice >= picked.price && <span className="mt-1 block text-red-500">قیمت آفر باید کمتر از قیمت اصلی باشد</span>}
              </p>
            </>
          )}

          <Button
            className="w-full"
            disabled={!variantId || discountPrice <= 0 || (picked != null && discountPrice >= picked.price)}
            loading={mutations.create.isPending}
            onClick={() => {
              if (!variantId) return toast.error('ابتدا تنوع محصول را انتخاب کنید');
              mutations.create.mutate(
                {
                  product_variant_id: variantId,
                  discount_price: discountPrice,
                  stock,
                  starts_at: new Date().toISOString(),
                  expires_at: nowPlus(days),
                },
                { onSuccess: () => setModal(false) },
              );
            }}
          >
            <Flame size={16} /> فعال‌سازی پیشنهاد
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => { if (deleting) mutations.remove.mutate(deleting.id); setDeleting(null); }}
        title="حذف پیشنهاد"
        message={`پیشنهاد «${deleting?.productTitle}» غیرفعال و حذف می‌شود.`}
        confirmText="حذف کن"
        loading={mutations.remove.isPending}
      />
    </div>
  );
}
