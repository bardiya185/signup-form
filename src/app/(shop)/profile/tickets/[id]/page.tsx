'use client';
/**
 * گفت‌وگوی تیکت — نمایش پیام‌ها + پاسخ + بستن تیکت
 */
import { use, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Send, XCircle } from 'lucide-react';
import { useCloseTicket, useTicket, useTicketMessage } from '@/hooks/account';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageLoading, EmptyState } from '@/components/ui/states';
import { jdatetime } from '@/lib/format';
import { cn } from '@/utils/cn';

export default function TicketThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const ticket = useTicket(id);
  const sendMessage = useTicketMessage(id);
  const closeTicket = useCloseTicket(id);
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const messages = ticket.data?.data.messages.length;
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (ticket.isLoading) return <PageLoading label="در حال بارگذاری گفت‌وگو…" />;
  if (ticket.isError || !ticket.data) {
    return (
      <EmptyState
        icon="search"
        title="تیکت یافت نشد"
        action={<Link href="/profile/tickets"><Button size="sm">بازگشت به تیکت‌ها</Button></Link>}
      />
    );
  }

  const t = ticket.data.data;
  const closed = t.status === 'closed';

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/profile/tickets" className="flex items-center gap-1 text-xs font-bold text-zinc-400 transition hover:text-brand">
            <ChevronRight size={14} /> تیکت‌های پشتیبانی
          </Link>
          <h1 className="mt-1.5 text-base font-black text-zinc-900 dark:text-white">{t.subject}</h1>
          <p className="mt-1 text-[11px] text-zinc-400">
            {t.departmentFa} — ثبت‌شده در {jdatetime(t.createdAt)}
            {t.orderNumber && <> — سفارش <bdi dir="ltr" className="font-mono">{t.orderNumber}</bdi></>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={closed ? 'zinc' : 'green'}>{t.statusFa}</Badge>
          <Badge tone={t.priority === 'urgent' ? 'red' : t.priority === 'high' ? 'amber' : 'zinc'}>{t.priorityFa}</Badge>
          {!closed && (
            <Button size="sm" variant="outline" onClick={() => closeTicket.mutate(undefined)} loading={closeTicket.isPending}>
              <XCircle size={14} /> بستن تیکت
            </Button>
          )}
        </div>
      </div>

      {/* پیام‌ها */}
      <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        {t.messages.map((m) => (
          <div key={m.id} className={cn('flex', m.isAdmin ? 'justify-start' : 'justify-end')} dir="rtl">
            <div
              className={cn(
                'max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[70%]',
                m.isAdmin
                  ? 'rounded-tr-sm bg-zinc-100 dark:bg-zinc-800'
                  : 'rounded-tl-sm bg-brand text-white',
              )}
            >
              <p className={cn('text-[10px] font-bold', m.isAdmin ? 'text-zinc-400' : 'text-white/70')}>
                {m.isAdmin ? `پشتیبانی (${m.authorName})` : 'شما'} — {jdatetime(m.createdAt)}
              </p>
              <p className={cn('mt-1 whitespace-pre-line text-sm leading-7', m.isAdmin ? 'text-zinc-700 dark:text-zinc-200' : 'text-white')}>
                {m.body}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* فرم پاسخ */}
      {closed ? (
        <p className="rounded-2xl bg-zinc-100 p-4 text-center text-xs font-bold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
          این تیکت بسته شده است. در صورت نیاز، تیکت جدیدی ثبت کنید.
        </p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (text.trim()) sendMessage.mutate(text.trim(), { onSuccess: () => setText('') });
          }}
          className="flex items-end gap-2"
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            placeholder="پاسخ خود را بنویسید…"
            className="flex-1 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand dark:border-zinc-700 dark:bg-zinc-900"
          />
          <Button type="submit" size="lg" loading={sendMessage.isPending} disabled={!text.trim()}>
            <Send size={16} /> ارسال
          </Button>
        </form>
      )}
    </div>
  );
}
