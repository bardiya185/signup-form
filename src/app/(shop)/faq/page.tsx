'use client';
/**
 * سوالات متداول — آکاردئون دسته‌بندی‌شده با انیمیشن
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { CircleHelp, Minus, Plus } from 'lucide-react';
import { http, type Envelope } from '@/lib/http';
import { PageLoading } from '@/components/ui/states';
import { faDigits } from '@/lib/format';
import { cn } from '@/utils/cn';

interface Faq { id: number; category: string; question: string; answer: string }

const CATEGORY_FA: Record<string, string> = {
  orders: 'سفارش‌ها و خرید',
  payment: 'پرداخت',
  shipping: 'ارسال و تحویل',
  returns: 'مرجوعی',
  account: 'حساب کاربری',
  general: 'عمومی',
};

export default function FaqPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['faqs'],
    queryFn: () => http.get<Envelope<Faq[]>>('/faqs'),
    staleTime: 300_000,
  });
  const [openId, setOpenId] = useState<number | null>(null);

  if (isLoading) return <PageLoading label="در حال بارگذاری سوالات…" />;

  const items = data?.data ?? [];
  const groups = items.reduce<Record<string, Faq[]>>((acc, f) => {
    (acc[f.category] ??= []).push(f);
    return acc;
  }, {});

  let index = 0;

  return (
    <div className="container-page max-w-4xl py-10">
      <div className="mb-8 text-center">
        <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand dark:bg-brand/15">
          <CircleHelp size={28} />
        </span>
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white">سوالات متداول</h1>
        <p className="mt-2 text-sm text-zinc-400">پاسخ پرتکرارترین پرسش‌های شما را اینجا گردآوری کرده‌ایم</p>
      </div>

      {Object.entries(groups).map(([cat, faqs]) => (
        <section key={cat} className="mb-8">
          <h2 className="mb-3 text-sm font-black text-zinc-800 dark:text-zinc-100">
            {CATEGORY_FA[cat] ?? cat}
          </h2>
          <div className="space-y-2">
            {faqs.map((f) => {
              const num = ++index;
              const open = openId === f.id;
              return (
                <div
                  key={f.id}
                  className={cn(
                    'overflow-hidden rounded-2xl border bg-white transition dark:bg-zinc-900',
                    open ? 'border-brand/30 shadow-lg shadow-brand/5' : 'border-zinc-200 dark:border-zinc-800',
                  )}
                >
                  <button
                    onClick={() => setOpenId(open ? null : f.id)}
                    className="flex w-full items-center gap-3 p-4 text-start"
                    aria-expanded={open}
                  >
                    <span className={cn(
                      'flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-black',
                      open ? 'bg-brand text-white' : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800',
                    )}>
                      {faDigits(num)}
                    </span>
                    <span className="flex-1 text-sm font-bold text-zinc-800 dark:text-zinc-100">{f.question}</span>
                    {open ? <Minus size={16} className="shrink-0 text-brand" /> : <Plus size={16} className="shrink-0 text-zinc-400" />}
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <p className="border-t border-dashed border-zinc-100 px-5 py-4 text-sm leading-8 text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                          {f.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <p className="rounded-2xl bg-zinc-50 p-5 text-center text-xs text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400">
        پاسخ خود را پیدا نکردید؟ از بخش <a href="/profile/tickets" className="font-bold text-brand">تیکت پشتیبانی</a> یا صفحه <a href="/contact" className="font-bold text-brand">تماس با ما</a> با ما در ارتباط باشید.
      </p>
    </div>
  );
}
