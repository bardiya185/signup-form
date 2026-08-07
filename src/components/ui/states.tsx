'use client';
import { cn } from '@/utils/cn';
import { Loader2, PackageX, RefreshCw, SearchX, ShoppingCart, HeartCrack, type LucideIcon } from 'lucide-react';
import { Button } from './button';
import type { ReactNode } from 'react';

export function Spinner({ size = 22, className }: { size?: number; className?: string }) {
  return <Loader2 size={size} className={cn('animate-spin text-brand', className)} />;
}

export function PageLoading({ label = 'در حال بارگذاری…' }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
      <Spinner size={34} />
      <span className="text-sm text-zinc-500">{label}</span>
    </div>
  );
}

const icons: Record<string, LucideIcon> = {
  search: SearchX,
  cart: ShoppingCart,
  product: PackageX,
  heart: HeartCrack,
};

export function EmptyState({
  icon = 'search',
  title,
  description,
  action,
  className,
}: {
  icon?: keyof typeof icons;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  const Icon = icons[icon] ?? SearchX;
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700', className)}>
      <div className="rounded-full bg-zinc-100 p-5 dark:bg-zinc-800">
        <Icon size={36} className="text-zinc-400" />
      </div>
      <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100">{title}</h3>
      {description && <p className="max-w-sm text-sm leading-6 text-zinc-500 dark:text-zinc-400">{description}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ onRetry, message }: { onRetry?: () => void; message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-red-50/60 py-14 text-center dark:bg-red-500/10">
      <p className="text-sm font-bold text-red-600 dark:text-red-300">{message ?? 'خطایی رخ داد؛ لطفاً مجدداً تلاش کنید'}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw size={14} /> تلاش مجدد
        </Button>
      )}
    </div>
  );
}
