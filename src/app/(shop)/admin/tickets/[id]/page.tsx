'use client';
/**
 * گفتگوی تیکت — رشته پیام‌ها + پاسخ ادمین + بستن تیکت
 */
import { use, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Lock, Send } from 'lucide-react';
import { useAdminTicketDetail, useAdminTicketMutations } from '@/hooks/admin';
import { panelCard } from '@/components/admin/panel-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageLoading } from '@/components/ui/states';
import { jdatetime } from '@/lib/format';
import { cn } from '@/utils/cn';

export default function AdminTicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const ticket = useAdminTicketDetail(id);
  const mutations = useAdminTicketMutations(id);
  const [reply, setReply] = useState('');

  const t = ticket.data?.data;
  if (ticket.isLoading) return <PageLoading />;
  if (!t) return <p className="py-16 text-center text-sm text-zinc-400">تیکت یافت نشد</p>;

  const closed = t.status === 'closed';

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <Link href="/admin/tickets" className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 transition hover:text-brand">
          <ArrowRight size={14} /> بازگشت به تیکت‌ها
        </Link>
        {!closed && (
          <Button variant="outline" size="sm" loading={mutations.close.isPending} onClick={() => mutations.close.mutate()}>
            <Lock size={13} /> بستن تیکت
          </Button>
        )}
      </div>

      {/* سربرگ تیکت */}
      <div className={cn('p-5', panelCard)}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-base font-black text-zinc-900 dark:text-white">{t.subject}</h1>
            <p className="mt-1 text-xs text-zinc-400">
              {t.requesterName}
              {t.orderNumber && <> • سفارش <span dir="ltr" className="font-mono">{t.orderNumber}</span></>}
              {' '}• {jdatetime(t.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone="blue">{t.departmentFa}</Badge>
            <Badge tone={t.priority === 'urgent' ? 'red' : t.priority === 'high' ? 'amber' : 'zinc'}>{t.priorityFa}</Badge>
            <Badge tone={closed ? 'zinc' : t.status === 'answered' ? 'green' : 'amber'}>{t.statusFa}</Badge>
          </div>
        </div>
      </div>

      {/* رشته پیام‌ها */}
      <div className="space-y-3">
        {t.messages.map((m) => (
          <div key={m.id} className={cn('flex', m.isAdmin ? 'justify-start' : 'justify-end')}>
            <div
              className={cn(
                'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-7 shadow-sm',
                m.isAdmin
                  ? 'rounded-tr-sm border border-zinc-200 bg-white text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200'
                  : 'rounded-tl-sm bg-brand text-white',
              )}
            >
              <p className={cn('mb-1 text-[10px] font-bold', m.isAdmin ? 'text-zinc-400' : 'text-white/70')}>
                {m.isAdmin ? `پشتیبانی (${m.authorName})` : m.authorName} • {jdatetime(m.createdAt)}
              </p>
              {m.body}
            </div>
          </div>
        ))}
      </div>

      {/* فرم پاسخ */}
      {!closed ? (
        <form
          className={cn('space-y-3 p-4', panelCard)}
          onSubmit={(e) => {
            e.preventDefault();
            if (reply.trim().length >= 2) {
              mutations.reply.mutate(reply.trim(), { onSuccess: () => setReply('') });
            }
          }}
        >
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={4}
            placeholder="پاسخ خود را بنویسید…"
            className="w-full resize-none rounded-xl border border-zinc-200 bg-white p-3 text-sm leading-7 outline-none transition focus:border-brand dark:border-zinc-700 dark:bg-zinc-950"
          />
          <Button type="submit" className="w-full sm:w-auto" loading={mutations.reply.isPending} disabled={reply.trim().length < 2}>
            <Send size={14} /> ارسال پاسخ
          </Button>
        </form>
      ) : (
        <p className="rounded-2xl border border-dashed border-zinc-200 py-4 text-center text-xs text-zinc-400 dark:border-zinc-800">
          این تیکت بسته شده است
        </p>
      )}
    </div>
  );
}
