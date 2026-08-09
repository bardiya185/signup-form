'use client';
/**
 * دسته‌بندی‌ها — درخت + ایجاد/ویرایش/حذف + مرتب‌سازی
 */
import { useState } from 'react';
import { ChevronLeft, FolderTree, PenLine, Plus, Trash2 } from 'lucide-react';
import { useAdminCategories, useAdminCategoryMutations } from '@/hooks/admin';
import { PanelTitle } from '@/components/admin/panel-shell';
import { panelCard } from '@/components/admin/panel-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog, Modal } from '@/components/ui/modal';
import { Field, Input } from '@/components/ui/input';
import { faDigits } from '@/lib/format';
import { cn } from '@/utils/cn';
import type { AdminCategoryRow } from '@/types/admin';

interface Node extends AdminCategoryRow { children: Node[] }
const buildTree = (rows: AdminCategoryRow[]): Node[] => {
  const map = new Map<number, Node>(rows.map((r) => [r.id, { ...r, children: [] }]));
  const roots: Node[] = [];
  map.forEach((n) => {
    if (n.parent_id && map.has(n.parent_id)) map.get(n.parent_id)!.children.push(n);
    else roots.push(n);
  });
  return roots;
};

export default function AdminCategoriesPage() {
  const categories = useAdminCategories();
  const mutations = useAdminCategoryMutations();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<AdminCategoryRow | null>(null);
  const [deleting, setDeleting] = useState<AdminCategoryRow | null>(null);
  const [form, setForm] = useState({ title: '', parent_id: 0, sort_order: 0, is_active: true });

  const rows = categories.data?.data ?? [];
  const tree = buildTree(rows);

  const openCreate = (parentId = 0) => {
    setEditing(null);
    setForm({ title: '', parent_id: parentId, sort_order: 0, is_active: true });
    setModal(true);
  };
  const openEdit = (c: AdminCategoryRow) => {
    setEditing(c);
    setForm({ title: c.title, parent_id: c.parent_id ?? 0, sort_order: c.sort_order, is_active: c.is_active });
    setModal(true);
  };

  const actions = (c: AdminCategoryRow, isChild: boolean) => (
    <div className="flex items-center gap-0.5 opacity-0 transition group-hover:opacity-100">
      {!isChild && (
        <button onClick={() => openCreate(c.id)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-500/10" title="زیردسته جدید">
          <Plus size={14} />
        </button>
      )}
      <button onClick={() => openEdit(c)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-sky-500/10" title="ویرایش">
        <PenLine size={14} />
      </button>
      <button onClick={() => setDeleting(c)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10" title="حذف">
        <Trash2 size={14} />
      </button>
    </div>
  );

  return (
    <div>
      <PanelTitle
        title="دسته‌بندی‌ها"
        description={`${faDigits(rows.length)} دسته در ${faDigits(tree.length)} گروه اصلی`}
        action={<Button onClick={() => openCreate()}><Plus size={16} /> دسته اصلی جدید</Button>}
      />

      <div className={`${panelCard} divide-y divide-zinc-50 p-2 dark:divide-zinc-800/60`}>
        {categories.isLoading && <p className="p-6 text-center text-sm text-zinc-400">در حال بارگذاری…</p>}
        {!categories.isLoading && tree.length === 0 && <p className="p-6 text-center text-sm text-zinc-400">دسته‌ای تعریف نشده است.</p>}
        {tree.map((root) => (
          <div key={root.id} className="group py-1">
            <div className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
              <FolderTree size={17} className="text-brand" />
              <span className="flex-1 text-sm font-black text-zinc-800 dark:text-zinc-100">{root.title}</span>
              <span className="font-mono text-[10px] text-zinc-400" dir="ltr">{root.slug}</span>
              <Badge tone={root.is_active ? 'green' : 'zinc'}>{root.is_active ? 'فعال' : 'غیرفعال'}</Badge>
              {actions(root, false)}
            </div>
            {root.children.length > 0 && (
              <div className="ms-8 mt-1 space-y-0.5 border-s-2 border-dashed border-zinc-200 ps-3 dark:border-zinc-700">
                {root.children.map((child) => (
                  <div key={child.id} className="group flex items-center gap-2.5 rounded-lg px-3 py-2 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <ChevronLeft size={13} className="text-zinc-300" />
                    <span className="flex-1 text-xs font-bold text-zinc-600 dark:text-zinc-300">{child.title}</span>
                    <span className="font-mono text-[10px] text-zinc-400" dir="ltr">{child.slug}</span>
                    <Badge tone={child.is_active ? 'green' : 'zinc'}>{child.is_active ? 'فعال' : 'غیرفعال'}</Badge>
                    {actions(child, true)}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* مودال ایجاد/ویرایش */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? `ویرایش «${editing.title}»` : 'دسته‌بندی جدید'} size="sm">
        <div className="space-y-3.5">
          <Field label="عنوان دسته" required>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} autoFocus />
          </Field>
          {!editing && (
            <Field label="دسته والد">
              <select
                value={form.parent_id}
                onChange={(e) => setForm({ ...form, parent_id: Number(e.target.value) })}
                className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              >
                <option value={0}>بدون والد (دسته اصلی)</option>
                {rows.filter((r) => !r.parent_id).map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
              </select>
            </Field>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Field label="ترتیب نمایش">
              <Input type="number" min={0} value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} dir="ltr" />
            </Field>
            {editing && (
              <Field label="وضعیت">
                <label className={cn('flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 px-3 text-sm font-bold dark:border-zinc-700', form.is_active ? 'text-emerald-600' : 'text-zinc-400')}>
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="size-4 accent-emerald-500" />
                  {form.is_active ? 'فعال' : 'غیرفعال'}
                </label>
              </Field>
            )}
          </div>
          <Button
            className="w-full"
            disabled={!form.title.trim()}
            loading={mutations.create.isPending || mutations.update.isPending}
            onClick={() => {
              const done = { onSuccess: () => setModal(false) };
              if (editing) mutations.update.mutate({ id: editing.id, title: form.title, sort_order: form.sort_order, is_active: form.is_active }, done);
              else mutations.create.mutate({ title: form.title, parent_id: form.parent_id || null, sort_order: form.sort_order }, done);
            }}
          >
            {editing ? 'ذخیره تغییرات' : 'ایجاد دسته'}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => { if (deleting) mutations.remove.mutate(deleting.id); setDeleting(null); }}
        title="حذف دسته‌بندی"
        message={`«${deleting?.title}» حذف می‌شود. اگر محصولی به آن متصل باشد حذف ناموفق خواهد بود.`}
        confirmText="حذف کن"
        loading={mutations.remove.isPending}
      />
    </div>
  );
}
