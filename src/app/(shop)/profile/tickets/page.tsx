'use client';
/**
 * تیکت‌های پشتیبانی — لیست + ثبت تیکت جدید
 */
import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { MessageSquareText, Plus } from 'lucide-react';
import { useCreateTicket, useTickets } from '@/hooks/account';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Field, Input, inputClass } from '@/components/ui/input';
import { EmptyState, Spinner } from '@/components/ui/states';
import { faDigits, timeAgo } from '@/lib/format';
import { cn } from '@/utils/cn';
import type { TicketDepartment, TicketPriority } from '@/types/account';

const DEPARTMENTS: { value: TicketDepartment; label: string }[] = [
  { value: 'orders', label: 'سفارش‌ها' },
  { value: 'payments', label: 'پرداخت و صورتحساب' },
  { value: 'returns', label: 'مرجوعی و گارانتی' },
  { value: 'technical', label: 'فنی' },
  { value: 'general', label: 'عمومی' },
];
const PRIORITIES: { value: TicketPriority; label: string }[] = [
  { value: 'low', label: 'کم' },
  { value: 'medium', label: 'متوسط' },
  { value: 'high', label: 'زیاد' },
  { value: 'urgent', label: 'فوری' },
];

const statusTone = (s: string) =>
  s === 'open' ? 'blue' : s === 'answered' ? 'green' : s === 'pending' ? 'amber' : 'zinc';

interface NewTicketForm {
  department: TicketDepartment;
  subject: string;
  priority: TicketPriority;
  message: string;
}

export default function TicketsPage() {
  const [page, setPage] = useState(1);
  const tickets = useTickets(page);
  const create = useCreateTicket();
  const [modal, setModal] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<NewTicketForm>({
    defaultValues: { department: 'orders', priority: 'medium', subject: '', message: '' },
  });

  const list = tickets.data?.data ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-lg font-black text-zinc-900 dark:text-white">
          <MessageSquareText size={20} className="text-brand" /> تیکت‌های پشتیبانی
        </h1>
        <Button size="sm" onClick={() => setModal(true)}><Plus size={15} /> تیکت جدید</Button>
      </div>

      {tickets.isLoading && <div className="flex justify-center py-14"><Spinner size={30} /></div>}

      {tickets.data && list.length === 0 && (
        <EmptyState
          icon="search"
          title="تیکتی ثبت نکرده‌اید"
          description="برای هر پرسش یا مشکلی، کارشناسان ما پاسخگو هستند."
          action={<Button size="sm" onClick={() => setModal(true)}>ثبت اولین تیکت</Button>}
        />
      )}

      <div className="space-y-3">
        {list.map((t) => (
          <Link
            key={t.id}
            href={`/profile/tickets/${t.id}`}
            className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-zinc-800 dark:text-zinc-100">{t.subject}</p>
              <p className="mt-1 text-[11px] text-zinc-400">
                {t.departmentFa}
                {t.orderNumber && <> — سفارش <bdi dir="ltr" className="font-mono">{t.orderNumber}</bdi></>}
                {' '}— آخرین به‌روزرسانی: {timeAgo(t.lastMessageAt)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge tone={t.priority === 'urgent' ? 'red' : t.priority === 'high' ? 'amber' : 'zinc'}>{t.priorityFa}</Badge>
              <Badge tone={statusTone(t.status)}>{t.statusFa}</Badge>
            </div>
          </Link>
        ))}
      </div>

      {tickets.data && tickets.data.meta.last_page > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: tickets.data.meta.last_page }, (_, i) => i + 1).map((p) => (
            <button
              key={p} onClick={() => setPage(p)}
              className={cn('size-10 rounded-xl text-sm font-bold', p === page ? 'bg-brand text-white' : 'bg-white text-zinc-600 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-zinc-700')}
            >
              {faDigits(p)}
            </button>
          ))}
        </div>
      )}

      {/* مودال ثبت تیکت */}
      <Modal open={modal} onClose={() => setModal(false)} title="ثبت تیکت جدید">
        <form
          onSubmit={handleSubmit((v) =>
            create.mutate(v, { onSuccess: () => { setModal(false); reset(); } }),
          )}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <Field label="دپارتمان">
              <select {...register('department')} className={inputClass()}>
                {DEPARTMENTS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </Field>
            <Field label="اولویت">
              <select {...register('priority')} className={inputClass()}>
                {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </Field>
          </div>
          <Field label="موضوع" error={errors.subject?.message} required>
            <Input {...register('subject', { required: 'موضوع را بنویسید', minLength: { value: 4, message: 'حداقل ۴ حرف' } })} invalid={!!errors.subject} />
          </Field>
          <Field label="شرح مشکل یا درخواست" error={errors.message?.message} required>
            <textarea
              {...register('message', { required: 'شرح تیکت را بنویسید', minLength: { value: 5, message: 'حداقل ۵ حرف' } })}
              rows={4}
              className={inputClass(!!errors.message)}
            />
          </Field>
          <Button type="submit" className="w-full" loading={create.isPending}>ثبت تیکت</Button>
        </form>
      </Modal>
    </div>
  );
}
