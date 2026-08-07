'use client';
import { useUiStore } from '@/stores/ui.store';
import { cn } from '@/utils/cn';
import { CheckCircle2, Info, X, XCircle } from 'lucide-react';

const icons = {
  success: <CheckCircle2 size={20} className="text-emerald-500" />,
  error: <XCircle size={20} className="text-red-500" />,
  info: <Info size={20} className="text-sky-500" />,
};

export function Toaster() {
  const { toasts, dismissToast } = useUiStore();
  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-[100] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4 sm:left-auto sm:right-6 sm:translate-x-0 sm:px-0">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'pointer-events-auto flex items-start gap-3 rounded-2xl border bg-white p-4 shadow-xl shadow-zinc-900/5 animate-rise-in',
            'dark:bg-zinc-900 dark:border-white/10',
            t.type === 'success' && 'border-emerald-200 dark:border-emerald-500/30',
            t.type === 'error' && 'border-red-200 dark:border-red-500/30',
            t.type === 'info' && 'border-sky-200 dark:border-sky-500/30',
          )}
          role="alert"
        >
          <span className="mt-0.5 shrink-0">{icons[t.type]}</span>
          <div className="flex-1">
            {t.title && <p className="text-sm font-black text-zinc-900 dark:text-white">{t.title}</p>}
            <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t.message}</p>
          </div>
          <button onClick={() => dismissToast(t.id)} aria-label="بستن" className="text-zinc-400 transition hover:text-zinc-600">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
