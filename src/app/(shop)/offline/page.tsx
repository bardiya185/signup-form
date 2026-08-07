'use client';
/**
 * صفحه آفلاین — هنگام قطعی اینترنت توسط سرویس‌ورکر نمایش داده می‌شود
 */
import { WifiOff, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OfflinePage() {
  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <span className="flex size-20 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
        <WifiOff size={36} />
      </span>
      <h1 className="mt-5 text-xl font-black text-zinc-900 dark:text-white">اتصال اینترنت قطع است</h1>
      <p className="mt-2 max-w-sm text-sm leading-7 text-zinc-500 dark:text-zinc-400">
        برای ادامه خرید به اینترنت نیاز داریم. پس از اتصال مجدد، صفحه را دوباره بارگذاری کنید.
      </p>
      <Button className="mt-6" onClick={() => window.location.reload()}>
        <RotateCcw size={16} /> تلاش مجدد
      </Button>
    </div>
  );
}
