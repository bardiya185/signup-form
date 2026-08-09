'use client';
/**
 * تب‌های محصول: معرفی، مشخصات فنی، دیدگاه‌ها (با فرم ثبت) و پرسش‌وپاسخ
 */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HelpCircle, MessageSquareText, Minus, Plus, Send, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ProductDetailDto, QuestionDto } from '@/types/dto';
import { useProductReviews } from '@/hooks/api';
import { http, firstError, type Envelope } from '@/lib/http';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from '@/stores/ui.store';
import { faDigits, jdate, timeAgo } from '@/lib/format';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';
import { StarRating, StarRatingInput } from '@/components/ui/rating';
import { Spinner } from '@/components/ui/states';
import { inputClass } from '@/components/ui/input';
import { faPercent } from '@/lib/format';

const TABS = [
  { id: 'desc', label: 'معرفی' },
  { id: 'attrs', label: 'مشخصات فنی' },
  { id: 'reviews', label: 'دیدگاه‌ها' },
  { id: 'questions', label: 'پرسش و پاسخ' },
] as const;
type TabId = (typeof TABS)[number]['id'];

/* ─── فرم دیدگاه ─── */
function ReviewForm({ slug }: { slug: string }) {
  const qc = useQueryClient();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [pros, setPros] = useState<string[]>([]);
  const [cons, setCons] = useState<string[]>([]);
  const [proInput, setProInput] = useState('');
  const [conInput, setConInput] = useState('');

  const submit = useMutation({
    mutationFn: () =>
      http.post<Envelope<{ message: string }>>(`/products/${slug}/reviews`, {
        title, body, rating, pros, cons,
      }),
    onSuccess: (res) => {
      toast.success(res.data.message);
      setTitle(''); setBody(''); setRating(0); setPros([]); setCons([]);
      void qc.invalidateQueries({ queryKey: ['reviews', slug] });
    },
    onError: (e) => toast.error(firstError(e)),
  });

  const chipList = (
    items: string[], setItems: (v: string[]) => void,
    value: string, setValue: (v: string) => void,
    positive: boolean,
  ) => (
    <div>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (value.trim()) { setItems([...items, value.trim()]); setValue(''); }
            }
          }}
          placeholder={positive ? 'نقطه قوت + اینتر' : 'نقطه ضعف + اینتر'}
          className={cn(inputClass(), 'text-xs')}
        />
        <Button
          type="button" variant="outline" size="sm"
          onClick={() => { if (value.trim()) { setItems([...items, value.trim()]); setValue(''); } }}
        >
          <Plus size={14} />
        </Button>
      </div>
      {items.length > 0 && (
        <ul className="mt-2 space-y-1">
          {items.map((p, i) => (
            <li key={i} className={cn('flex items-center justify-between rounded-lg px-3 py-1.5 text-xs', positive ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300')}>
              {p}
              <button type="button" onClick={() => setItems(items.filter((_, j) => j !== i))} aria-label="حذف">
                <Minus size={13} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (!rating) return toast.error('امتیاز را انتخاب کنید'); submit.mutate(); }}
      className="space-y-3 rounded-2xl border border-zinc-200 bg-zinc-50/50 p-5 dark:border-zinc-800 dark:bg-zinc-900/50"
    >
      <h4 className="text-sm font-black text-zinc-800 dark:text-zinc-100">دیدگاه خود را ثبت کنید</h4>
      <StarRatingInput value={rating} onChange={setRating} />
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان دیدگاه (اختیاری)" className={inputClass()} />
      <textarea
        value={body} onChange={(e) => setBody(e.target.value)} rows={4} required minLength={10}
        placeholder="متن دیدگاه…" className={inputClass()}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {chipList(pros, setPros, proInput, setProInput, true)}
        {chipList(cons, setCons, conInput, setConInput, false)}
      </div>
      <Button type="submit" loading={submit.isPending}><Send size={15} /> ثبت دیدگاه</Button>
    </form>
  );
}

/* ─── فرم پرسش ─── */
function QuestionForm({ slug }: { slug: string }) {
  const qc = useQueryClient();
  const [question, setQuestion] = useState('');
  const submit = useMutation({
    mutationFn: () => http.post<Envelope<{ message: string }>>(`/products/${slug}/questions`, { question }),
    onSuccess: (res) => {
      toast.success(res.data.message);
      setQuestion('');
      void qc.invalidateQueries({ queryKey: ['product', slug] });
    },
    onError: (e) => toast.error(firstError(e)),
  });
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); submit.mutate(); }}
      className="flex items-start gap-2 rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50"
    >
      <textarea
        value={question} onChange={(e) => setQuestion(e.target.value)} rows={2} required minLength={5}
        placeholder="پرسش خود درباره این کالا را بپرسید…" className={cn(inputClass(), 'flex-1')}
      />
      <Button type="submit" loading={submit.isPending}><Send size={15} /> پرسش</Button>
    </form>
  );
}

export function ProductTabs({
  product,
  questions,
}: {
  product: ProductDetailDto;
  questions: QuestionDto[];
}) {
  const [tab, setTab] = useState<TabId>('desc');
  const [page, setPage] = useState(1);
  const reviews = useProductReviews(product.slug, page);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  return (
    <section className="mt-10 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      {/* سربرگ تب‌ها */}
      <div className="flex overflow-x-auto border-b border-zinc-100 dark:border-zinc-800" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'relative whitespace-nowrap px-5 py-4 text-sm font-bold transition',
              tab === t.id ? 'text-brand' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200',
            )}
          >
            {t.label}
            {t.id === 'reviews' && product.reviewCount > 0 && (
              <span className="ms-1 text-[11px] text-zinc-400">({faDigits(product.reviewCount)})</span>
            )}
            {t.id === 'questions' && product.questionsCount > 0 && (
              <span className="ms-1 text-[11px] text-zinc-400">({faDigits(product.questionsCount)})</span>
            )}
            {tab === t.id && <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-brand" />}
          </button>
        ))}
      </div>

      <div className="p-5 sm:p-7">
        {/* معرفی */}
        {tab === 'desc' && (
          <div className="prose prose-sm max-w-none leading-8 text-zinc-600 dark:text-zinc-300">
            {product.shortDescription && <p className="font-bold text-zinc-800 dark:text-zinc-100">{product.shortDescription}</p>}
            <p className="whitespace-pre-line">{product.body ?? 'توضیحاتی برای این کالا ثبت نشده است.'}</p>
          </div>
        )}

        {/* مشخصات */}
        {tab === 'attrs' && (
          product.attributes.length ? (
            <div className="grid gap-x-10 gap-y-3 sm:grid-cols-2">
              {product.attributes.map((a, i) => (
                <div key={i} className="flex items-center justify-between gap-4 border-b border-dashed border-zinc-200 pb-3 dark:border-zinc-700">
                  <span className="text-xs text-zinc-400">{a.title}</span>
                  <span className="text-sm font-bold text-zinc-700 dark:text-zinc-200">{a.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-400">مشخصات فنی برای این کالا ثبت نشده است.</p>
          )
        )}

        {/* دیدگاه‌ها */}
        {tab === 'reviews' && (
          <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
            <aside className="flex flex-row items-center gap-4 lg:flex-col lg:items-start">
              <div className="text-center">
                <div className="text-4xl font-black text-zinc-900 dark:text-white">{faDigits(product.rating)}</div>
                <StarRating value={product.rating} size={16} showValue={false} />
                <p className="mt-1 text-[11px] text-zinc-400">از مجموع {faDigits(product.reviewCount)} دیدگاه</p>
              </div>
            </aside>
            <div className="space-y-5">
              {reviews.isLoading && <Spinner />}
              {reviews.data?.data.map((r) => (
                <article key={r.id} className="border-b border-zinc-100 pb-5 last:border-0 dark:border-zinc-800">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                    <StarRating value={r.rating} size={13} showValue={false} />
                    <span className="font-bold text-zinc-700 dark:text-zinc-200">{r.authorName}</span>
                    {r.isBuyer && (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-bold text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">خریدار</span>
                    )}
                    <span>{jdate(r.createdAt)}</span>
                  </div>
                  <h4 className="mt-2 text-sm font-black text-zinc-800 dark:text-zinc-100">{r.title}</h4>
                  <p className="mt-1 text-sm leading-7 text-zinc-600 dark:text-zinc-300">{r.body}</p>
                  {(r.pros.length > 0 || r.cons.length > 0) && (
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {r.pros.length > 0 && (
                        <ul className="space-y-1">
                          {r.pros.map((p, i) => (
                            <li key={i} className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-300"><Plus size={12} />{p}</li>
                          ))}
                        </ul>
                      )}
                      {r.cons.length > 0 && (
                        <ul className="space-y-1">
                          {r.cons.map((c, i) => (
                            <li key={i} className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-300"><Minus size={12} />{c}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                  <div className="mt-3 flex items-center gap-3 text-[11px] text-zinc-400">
                    <span className="inline-flex items-center gap-1"><ThumbsUp size={13} /> {faDigits(r.likesCount)}</span>
                    <span className="inline-flex items-center gap-1"><ThumbsDown size={13} /> {faDigits(r.dislikesCount)}</span>
                  </div>
                </article>
              ))}
              {reviews.data && reviews.data.data.length === 0 && (
                <p className="text-sm text-zinc-400">هنوز دیدگاهی ثبت نشده است. اولین نفر باشید!</p>
              )}
              {reviews.data && reviews.data.meta.last_page > 1 && (
                <div className="flex justify-center gap-2">
                  {Array.from({ length: reviews.data.meta.last_page }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p} onClick={() => setPage(p)}
                      className={cn('size-9 rounded-xl text-sm font-bold', p === page ? 'bg-brand text-white' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300')}
                    >
                      {faDigits(p)}
                    </button>
                  ))}
                </div>
              )}

              {user ? (
                <ReviewForm slug={product.slug} />
              ) : (
                <div className="rounded-2xl bg-zinc-50 p-5 text-center text-sm text-zinc-500 dark:bg-zinc-800/50">
                  برای ثبت دیدگاه ابتدا{' '}
                  <button className="font-bold text-brand" onClick={() => router.push('/login')}>وارد حساب کاربری</button>{' '}
                  شوید.
                </div>
              )}
            </div>
          </div>
        )}

        {/* پرسش و پاسخ */}
        {tab === 'questions' && (
          <div className="space-y-5">
            {questions.length === 0 && <p className="text-sm text-zinc-400">هنوز پرسشی مطرح نشده است.</p>}
            {questions.map((qa) => (
              <div key={qa.id} className="space-y-3 border-b border-zinc-100 pb-5 last:border-0 dark:border-zinc-800">
                <div className="flex items-start gap-2">
                  <HelpCircle size={17} className="mt-0.5 shrink-0 text-sky-500" />
                  <div>
                    <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{qa.question}</p>
                    <p className="mt-1 text-[11px] text-zinc-400">{qa.askedBy} — {timeAgo(qa.createdAt)}</p>
                  </div>
                </div>
                {qa.answer && (
                  <div className="ms-6 flex items-start gap-2 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60">
                    <MessageSquareText size={15} className="mt-1 shrink-0 text-emerald-500" />
                    <p className="text-sm leading-7 text-zinc-600 dark:text-zinc-300">{qa.answer}</p>
                  </div>
                )}
              </div>
            ))}
            {user ? (
              <QuestionForm slug={product.slug} />
            ) : (
              <div className="rounded-2xl bg-zinc-50 p-5 text-center text-sm text-zinc-500 dark:bg-zinc-800/50">
                برای طرح پرسش ابتدا{' '}
                <button className="font-bold text-brand" onClick={() => router.push('/login')}>وارد شوید</button>.
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
