'use client';
/**
 * کیف پول — موجودی، شارژ از طریق درگاه و تراکنش‌ها
 */
import { useState } from 'react';
import { ArrowDownLeft, ArrowUpLeft, Plus, Wallet } from 'lucide-react';
import { useWallet, useWalletDeposit, useWalletTransactions } from '@/hooks/account';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { PageLoading } from '@/components/ui/states';
import { faDigits, formatPrice, jdatetime } from '@/lib/format';
import { cn } from '@/utils/cn';

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000, 1000000];
const cardCls = 'rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900';

export default function WalletPage() {
  const wallet = useWallet();
  const transactions = useWalletTransactions();
  const deposit = useWalletDeposit();
  const [modal, setModal] = useState(false);
  const [amount, setAmount] = useState(100000);
  const [gateway, setGateway] = useState<'zarinpal' | 'mellat' | 'saman'>('zarinpal');

  if (wallet.isLoading) return <PageLoading label="در حال بارگذاری کیف پول…" />;
  const w = wallet.data!.data;

  return (
    <div className="space-y-5">
      <h1 className="flex items-center gap-2 text-lg font-black text-zinc-900 dark:text-white">
        <Wallet size={20} className="text-brand" /> کیف پول
      </h1>

      {/* کارت موجودی */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-brand to-rose-500 p-6 text-white shadow-xl shadow-brand/25">
        <div className="absolute -left-8 -top-10 size-40 rounded-full bg-white/10 blur-2xl" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs opacity-80">موجودی قابل استفاده</p>
            <p className="mt-1 text-3xl font-black">{formatPrice(w.balance)} <span className="text-sm font-normal">تومان</span></p>
            <p className="mt-2 text-[11px] opacity-75">
              مجموع شارژ: {formatPrice(w.totalDeposits)} — مجموع برداشت: {formatPrice(w.totalWithdraws)}
            </p>
          </div>
          <Button variant="secondary" size="lg" onClick={() => setModal(true)} className="bg-white text-brand hover:bg-white/90">
            <Plus size={17} /> شارژ کیف پول
          </Button>
        </div>
      </div>

      {/* تراکنش‌ها */}
      <section className={cardCls}>
        <h2 className="mb-4 text-sm font-black text-zinc-800 dark:text-zinc-100">
          تراکنش‌های اخیر ({faDigits(w.transactionsCount)})
        </h2>
        {transactions.isLoading && <p className="py-6 text-center text-xs text-zinc-400">در حال بارگذاری…</p>}
        {transactions.data && transactions.data.data.length === 0 && (
          <p className="py-6 text-center text-xs text-zinc-400">تراکنشی ثبت نشده است.</p>
        )}
        <div className="space-y-1">
          {transactions.data?.data.map((t) => (
            <div key={t.id} className="flex items-center gap-3 rounded-xl px-2 py-3 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
              <span
                className={cn(
                  'flex size-9 shrink-0 items-center justify-center rounded-full',
                  t.type === 'deposit'
                    ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/15'
                    : 'bg-red-50 text-red-500 dark:bg-red-500/15',
                )}
              >
                {t.type === 'deposit' ? <ArrowDownLeft size={16} /> : <ArrowUpLeft size={16} />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-100">{t.typeFa}</p>
                {t.description && <p className="mt-0.5 truncate text-[11px] text-zinc-400">{t.description}</p>}
                <p className="mt-0.5 text-[10px] text-zinc-300 dark:text-zinc-500">{jdatetime(t.createdAt)}</p>
              </div>
              <span className={cn('text-sm font-black', t.type === 'deposit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500')}>
                {t.type === 'deposit' ? '+' : '−'}{formatPrice(t.amount)}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* مودال شارژ */}
      <Modal open={modal} onClose={() => setModal(false)} title="شارژ کیف پول" size="sm">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-zinc-700 dark:text-zinc-300">مبلغ شارژ (تومان)</label>
            <input
              type="number"
              min={10000}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-center text-lg font-black outline-none focus:border-brand dark:border-zinc-700 dark:bg-zinc-950"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {QUICK_AMOUNTS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAmount(a)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-[11px] font-bold transition',
                    amount === a ? 'border-brand bg-brand-soft text-brand dark:bg-brand/15' : 'border-zinc-200 text-zinc-500 dark:border-zinc-700',
                  )}
                >
                  {formatPrice(a)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-zinc-700 dark:text-zinc-300">درگاه پرداخت</label>
            <div className="grid grid-cols-3 gap-2">
              {(['zarinpal', 'mellat', 'saman'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGateway(g)}
                  className={cn(
                    'rounded-xl border-2 px-2 py-2.5 text-xs font-bold transition',
                    gateway === g ? 'border-brand bg-brand-soft text-brand dark:bg-brand/10' : 'border-zinc-200 text-zinc-500 dark:border-zinc-700',
                  )}
                >
                  {g === 'zarinpal' ? 'زرین‌پال' : g === 'mellat' ? 'بانک ملت' : 'بانک سامان'}
                </button>
              ))}
            </div>
          </div>
          <Button
            className="w-full" size="lg"
            disabled={amount < 10000}
            loading={deposit.isPending}
            onClick={() =>
              deposit.mutate({ amount, gateway }, { onSuccess: (res) => { window.location.href = res.data.payUrl; } })
            }
          >
            پرداخت {formatPrice(amount)} تومان
          </Button>
          <p className="text-center text-[10px] text-zinc-400">حداقل مبلغ شارژ ۱۰,۰۰۰ تومان است.</p>
        </div>
      </Modal>
    </div>
  );
}
