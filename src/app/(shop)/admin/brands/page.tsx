'use client';
/**
 * برندها — جدول ساده ایجاد/ویرایش/حذف/فعال
 */
import { useState } from 'react';
import { Award, PenLine, Plus, Trash2 } from 'lucide-react';
import { useAdminBrandMutations, useAdminBrands } from '@/hooks/admin';
import { PanelTitle } from '@/components/admin/panel-shell';
import { DataTable, Td, Tr } from '@/components/admin/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog, Modal } from '@/components/ui/modal';
import { Field, Input } from '@/components/ui/input';
import { faDigits } from '@/lib/format';
import type { AdminBrandRow } from '@/types/admin';

export default function AdminBrandsPage() {
  const brands = useAdminBrands();
  const mutations = useAdminBrandMutations();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<AdminBrandRow | null>(null);
  const [deleting, setDeleting] = useState<AdminBrandRow | null>(null);
  const [title, setTitle] = useState('');
  const rows = brands.data?.data ?? [];

  return (
    <div>
      <PanelTitle
        title="برندها"
        description={`${faDigits(rows.length)} برند فعال‌سازی‌شده`}
        action={<Button onClick={() => { setEditing(null); setTitle(''); setModal(true); }}><Plus size={16} /> برند جدید</Button>}
      />

      <DataTable
        head={['برند', 'نامک (Slug)', 'وضعیت', 'عملیات']}
        loading={brands.isLoading}
        empty={rows.length === 0}
      >
        {rows.map((b) => (
          <Tr key={b.id}>
            <Td>
              <span className="flex items-center gap-2.5 font-bold text-zinc-800 dark:text-zinc-100">
                <span className="flex size-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 dark:bg-zinc-800">
                  <Award size={16} />
                </span>
                {b.title}
              </span>
            </Td>
            <Td className="font-mono text-zinc-400" dir="ltr">{b.slug}</Td>
            <Td>
              <button onClick={() => mutations.update.mutate({ id: b.id, is_active: !b.is_active })} disabled={mutations.update.isPending}>
                <Badge tone={b.is_active ? 'green' : 'zinc'}>{b.is_active ? 'فعال' : 'غیرفعال'}</Badge>
              </button>
            </Td>
            <Td>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { setEditing(b); setTitle(b.title); setModal(true); }}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-sky-500/10" title="ویرایش"
                >
                  <PenLine size={15} />
                </button>
                <button onClick={() => setDeleting(b)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10" title="حذف">
                  <Trash2 size={15} />
                </button>
              </div>
            </Td>
          </Tr>
        ))}
      </DataTable>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? `ویرایش برند «${editing.title}»` : 'برند جدید'} size="sm">
        <div className="space-y-3.5">
          <Field label="نام برند" required>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثلاً اپل" autoFocus />
          </Field>
          <Button
            className="w-full"
            disabled={!title.trim()}
            loading={mutations.create.isPending || mutations.update.isPending}
            onClick={() => {
              const done = { onSuccess: () => setModal(false) };
              if (editing) mutations.update.mutate({ id: editing.id, title }, done);
              else mutations.create.mutate({ title }, done);
            }}
          >
            {editing ? 'ذخیره تغییرات' : 'ایجاد برند'}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => { if (deleting) mutations.remove.mutate(deleting.id); setDeleting(null); }}
        title="حذف برند"
        message={`برند «${deleting?.title}» حذف می‌شود. اگر محصولی به آن متصل باشد حذف ناموفق خواهد بود.`}
        confirmText="حذف کن"
        loading={mutations.remove.isPending}
      />
    </div>
  );
}
