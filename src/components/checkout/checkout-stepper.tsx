'use client';
/**
 * گام‌نمای فرایند خرید: آدرس → ارسال → پرداخت
 */
import { Check, MapPin, Truck, Wallet } from 'lucide-react';
import { cn } from '@/utils/cn';
import { faDigits } from '@/lib/format';

const STEPS = [
  { id: 1, label: 'آدرس تحویل', icon: MapPin },
  { id: 2, label: 'روش ارسال', icon: Truck },
  { id: 3, label: 'پرداخت', icon: Wallet },
];

export function CheckoutStepper({ current }: { current: number }) {
  return (
    <div className="mb-8 flex items-center justify-center gap-1 sm:gap-2" dir="ltr">
      {[...STEPS].reverse().map((step, i) => {
        const done = step.id < current;
        const active = step.id === current;
        const Icon = step.icon;
        return (
          <div key={step.id} className="flex items-center gap-1 sm:gap-2" dir="rtl">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'flex size-10 items-center justify-center rounded-full border-2 transition sm:size-11',
                  done && 'border-teal-500 bg-teal-500 text-white',
                  active && 'border-brand bg-brand text-white shadow-lg shadow-brand/30',
                  !done && !active && 'border-zinc-200 bg-white text-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-600',
                )}
              >
                {done ? <Check size={18} /> : <Icon size={18} />}
              </div>
              <span
                className={cn(
                  'text-[10px] font-bold sm:text-xs',
                  active ? 'text-brand' : done ? 'text-teal-600 dark:text-teal-400' : 'text-zinc-400',
                )}
              >
                {faDigits(step.id)}. {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn('mb-6 h-0.5 w-8 rounded-full sm:w-16', done ? 'bg-teal-500' : 'bg-zinc-200 dark:bg-zinc-700')} />
            )}
          </div>
        );
      })}
    </div>
  );
}
