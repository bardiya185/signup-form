'use client';
/**
 * PWA — ثبت سرویس‌ورکر + پیشنهاد نصب اپ (A2HS)
 */
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PwaRegister() {
  const [installEvt, setInstallEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => undefined);
    }
    const seenDismiss = localStorage.getItem('gnk_a2hs_dismissed');
    if (seenDismiss) setDismissed(true);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  const install = async () => {
    if (!installEvt) return;
    await installEvt.prompt();
    const choice = await installEvt.userChoice;
    if (choice.outcome === 'accepted') setInstallEvt(null);
  };

  const close = () => {
    setDismissed(true);
    localStorage.setItem('gnk_a2hs_dismissed', '1');
  };

  return (
    <AnimatePresence>
      {installEvt && !dismissed && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          className="fixed inset-x-4 bottom-4 z-[80] mx-auto max-w-md rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900"
          role="dialog"
          aria-label="نصب اپلیکیشن"
        >
          <button onClick={close} aria-label="بستن" className="absolute left-3 top-3 text-zinc-400 hover:text-zinc-600">
            <X size={16} />
          </button>
          <p className="text-sm font-black text-zinc-900 dark:text-white">اپلیکیشن گینان‌کالا را نصب کنید</p>
          <p className="mt-1 text-[11px] leading-5 text-zinc-500 dark:text-zinc-400">
            دسترسی سریع‌تر، تجربه تمام‌صفحه و کارکرد نسبی در زمان قطعی اینترنت.
          </p>
          <Button size="sm" className="mt-3 w-full" onClick={install}>
            <Download size={15} /> نصب اپلیکیشن
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
