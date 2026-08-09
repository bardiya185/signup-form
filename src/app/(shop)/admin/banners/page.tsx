'use client';
/**
 * بنرهای تبلیغاتی — لیست + ایجاد + فعال/غیرفعال + حذف
 */
import { useState } from 'react';
import { Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { useAdminBannerMutations, useAdminBanners } from '@/hooks/admin';
import { PanelTitle } from '@/components/admin/panel-shell';
import { DataTable, Td, Tr } from '@/components/admin/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog, Modal } from '@/components/ui/modal';
import { Field, Input } from '@/components/ui/input';
import { faDigits } from '@/lib/format';
import type { AdminBannerRow } from '@/types/admin';

const POSITION_FA: Record<string, string> = {
  hero: 'اسلایدر اصلی', sidebar: 'سایدبار خانه', category: 'دسته‌بندی', product: 'صفحه محصول',
};

const emptyForm = { title: '', image: '', link: '', position: 'hero', sort_order: 99 };

export default function AdminBannersPage() {
  const banners = useAdminBanners();
  const mutations = useAdminBannerMutations();
  const [modal, setModal] = useState(false);
  const [deleting, setDeleting] = useState<AdminBannerRow | null>(null);
  const [form, setForm] = useState(emptyForm);
  const rows = banners.data?.data ?? [];

  return (
    <div>
      <PanelTitle
        title="بنرهای تبلیغاتی"
        description={`${faDigits(rows.length)} بنر تعریف شده`}
        action={<Button onClick={() => { setForm(emptyForm); setModal(true); }}><Plus size={16} /> بنر جدید</Button>}
      />

      <DataTable
        head={['بنر', 'موقعیت', 'ترتیب', 'لینک', 'وضعیت', 'عملیات']}
        loading={banners.isLoading}
        empty={rows.length === 0}
      >
        {rows.map((b) => (
          <Tr key={b.id}>
            <Td>
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.image} alt={b.title} className="size-11 rounded-lg border border-zinc-100 object-cover dark:border-zinc-800" />
                <span className="font-bold text-zinc-800 dark:text-zinc-100">{b.title}</span>
              </div>
            </Td>
            <Td><Badge tone="blue">{POSITION_FA[b.position] ?? b.position}</Badge></Td>
            <Td>{faDigits(b.sort_order)}</Td>
            <Td className="max-w-40 truncate text-zinc-400" dir="ltr">{b.link ?? '—'}</Td>
            <Td>
              <button
                onClick={() => mutations.update.mutate({ id: b.id, is_active: !b.is_active })}
                disabled={mutations.update.isPending}
              >
                <Badge tone={b.is_active ? 'green' : 'zinc'}>{b.is_active ? 'فعال' : 'غیرفعال'}</Badge>
              </button>
            </Td>
            <Td>
              <button onClick={() => setDeleting(b)} className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10" title="حذف">
                <Trash2 size={15} />
              </button>
            </Td>
          </Tr>
        ))}
      </DataTable>

      <Modal open={modal} onClose={() => setModal(false)} title="ایجاد بنر" size="sm">
        <div className="space-y-3.5">
          <Field label="عنوان بنر" required>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="تخفیف ویژه مهر" />
          </Field>
          <Field label="نشانی تصویر" required>
            <Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} dir="ltr" placeholder="https://…" className="font-mono" />
          </Field>
          {form.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.image} alt="پیش‌نمایش" className="h-24 w-full rounded-xl border border-zinc-100 object-cover dark:border-zinc-800" />
          )}
          <div className="grid grid-cols-2 gap-3">
            <Field label="موقعیت نمایش">
              <select
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
                className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              >
                {Object.entries(POSITION_FA).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </Field>
            <Field label="ترتیب نمایش">
              <Input type="number" min={0} value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} dir="ltr" />
            </Field>
          </div>
          <Field label="لینک مقصد">
            <Input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} dir="ltr" placeholder="/incredible-offers (اختیاری)" className="font-mono" />
          </Field>
          <Button
            className="w-full"
            loading={mutations.create.isPending}
            disabled={!form.title.trim() || !form.image.trim()}
            onClick={() =>
              mutations.create.mutate(
                {
                  title: form.title,
                  image: form.image,
                  position: form.position,
                  sort_order: form.sort_order,
                  ...(form.link.trim() ? { link: form.link.trim() } : {}),
                },
                { onSuccess: () => setModal(false) },
              )
            }
          >
            <ImageIcon size={16} /> ایجاد بنر
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && mutations.remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
        title="حذف بنر"
        message={`بنر «${deleting?.title}» برای همیشه حذف شود؟`}
        loading={mutations.remove.isPending}
      />
    </div>
  );
}
