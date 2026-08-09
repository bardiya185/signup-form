'use client';
/**
 * کوپن‌های تخفیف — لیست + ایجاد + فعال/غیرفعال + حذف
 */
import { useState } from 'react';
import { Plus, TicketPercent, Trash2 } from 'lucide-react';
import { useAdminCouponMutations, useAdminCoupons } from '@/hooks/admin';
import { PanelTitle } from '@/components/admin/panel-shell';
import { DataTable, Td, Tr } from '@/components/admin/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog, Modal } from '@/components/ui/modal';
import { Field, Input } from '@/components/ui/input';
import { faDigits, faPercent, formatPrice, jdate } from '@/lib/format';
import type { AdminCouponRow } from '@/types/admin';

const emptyForm = {
  code: '', type: 'percentage' as 'percentage' | 'fixed', value: 10,
  max_discount: '', min_order_amount: '', usage_limit: '', per_user_limit: 1,
  expires_at: '',
};

export default function AdminCouponsPage() {
  const coupons = useAdminCoupons();
  const mutations = useAdminCouponMutations();
  const [modal, setModal] = useState(false);
  const [deleting, setDeleting] = useState<AdminCouponRow | null>(null);
  const [form, setForm] = useState(emptyForm);
  const rows = coupons.data?.data ?? [];

  const num = (v: string) => (v ? Number(v) : null);

  return (
    <div>
      <PanelTitle
        title="کوپن‌های تخفیف"
        description={`${faDigits(rows.length)} کوپن تعریف شده`}
        action={<Button onClick={() => { setForm(emptyForm); setModal(true); }}><Plus size={16} /> کوپن جدید</Button>}
      />

      <DataTable
        head={['کد', 'نوع', 'مقدار', 'سقف/کف خرید', 'مصرف', 'انقضا', 'وضعیت', 'عملیات']}
        loading={coupons.isLoading}
        empty={rows.length === 0}
      >
        {rows.map((c) => (
          <Tr key={c.id}>
            <Td>
              <span className="rounded-lg bg-zinc-100 px-2.5 py-1 font-mono text-xs font-black tracking-wider text-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" dir="ltr">
                {c.code}
              </span>
            </Td>
            <Td>{c.typeFa}</Td>
            <Td className="font-black text-zinc-800 dark:text-zinc-100">
              {c.type === 'percentage' ? faPercent(c.value) : `${formatPrice(c.value)} ت`}
            </Td>
            <Td className="text-zinc-400">
              {c.maxDiscount ? `سقف ${formatPrice(c.maxDiscount)}` : '—'}
              <br />{c.minOrderAmount ? `کف ${formatPrice(c.minOrderAmount)}` : ''}
            </Td>
            <Td>
              {faDigits(c.usedCount)}{c.usageLimit ? ` از ${faDigits(c.usageLimit)}` : ''}
            </Td>
            <Td className="text-zinc-400">{c.expiresAt ? jdate(c.expiresAt, 'medium') : 'بدون انقضا'}</Td>
            <Td>
              <button
                onClick={() => mutations.update.mutate({ id: c.id, is_active: !c.isActive })}
                disabled={mutations.update.isPending}
              >
                <Badge tone={c.isActive ? 'green' : 'zinc'}>{c.isActive ? 'فعال' : 'غیرفعال'}</Badge>
              </button>
            </Td>
            <Td>
              <button onClick={() => setDeleting(c)} className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10" title="حذف">
                <Trash2 size={15} />
              </button>
            </Td>
          </Tr>
        ))}
      </DataTable>

      {/* مودال ایجاد */}
      <Modal open={modal} onClose={() => setModal(false)} title="ایجاد کوپن تخفیف" size="sm">
        <div className="space-y-3.5">
          <Field label="کد کوپن (انگلیسی)" required>
            <Input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              dir="ltr" placeholder="OFF-2026" className="font-mono uppercase"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="نوع تخفیف">
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as 'percentage' | 'fixed' })}
                className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              >
                <option value="percentage">درصدی</option>
                <option value="fixed">مبلغی (تومان)</option>
              </select>
            </Field>
            <Field label={form.type === 'percentage' ? 'درصد (۱ تا ۱۰۰)' : 'مبلغ (تومان)'} required>
              <Input type="number" min={1} value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} dir="ltr" />
            </Field>
            <Field label="سقف تخفیف (تومان)">
              <Input type="number" value={form.max_discount} onChange={(e) => setForm({ ...form, max_discount: e.target.value })} dir="ltr" placeholder="اختیاری" />
            </Field>
            <Field label="کف مبلغ خرید (تومان)">
              <Input type="number" value={form.min_order_amount} onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })} dir="ltr" placeholder="اختیاری" />
            </Field>
            <Field label="محدودیت کل استفاده">
              <Input type="number" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: e.target.value })} dir="ltr" placeholder="نامحدود" />
            </Field>
            <Field label="انقضا (مثال: 1405/06/31)">
              <Input value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} dir="ltr" placeholder="اختیاری" />
            </Field>
          </div>
          <Button
            className="w-full"
            disabled={!form.code.trim()}
            loading={mutations.create.isPending}
            onClick={() => {
              const base: Record<string, unknown> = {
                code: form.code.trim(),
                type: form.type,
                value: form.value,
                max_discount: num(form.max_discount),
                min_order_amount: num(form.min_order_amount),
                usage_limit: num(form.usage_limit),
                per_user_limit: form.per_user_limit,
              };
              const payload = { ...base, ...(form.expires_at ? { expires_at: form.expires_at } : {}) };
              mutations.create.mutate(payload, { onSuccess: () => setModal(false) });
            }}
          >
            <TicketPercent size={16} /> ایجاد کوپن
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => { if (deleting) mutations.remove.mutate(deleting.id); setDeleting(null); }}
        title="حذف کوپن"
        message={`کوپن «${deleting?.code}» حذف می‌شود و دیگر قابل استفاده نیست.`}
        confirmText="حذف کن"
        loading={mutations.remove.isPending}
      />
    </div>
  );
}
