import { cn } from '@/utils/cn';

export function Spinner({className}:{className?:string}) {
  return <span aria-label="در حال بارگذاری" className={cn('inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent',className)}/>;
}

export function CartSkeleton() {
  return <div className="space-y-4 p-4" aria-label="در حال دریافت سبد خرید">
    {[1,2].map(item=><div className="flex gap-3" key={item}><div className="h-16 w-16 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800"/><div className="flex-1 space-y-2 py-1"><div className="h-3 w-4/5 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800"/><div className="h-3 w-2/5 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800"/></div></div>)}
  </div>;
}

export function ProductGridSkeleton({count=8}:{count?:number}) {
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">{Array.from({length:count}).map((_,index)=><div className="overflow-hidden rounded-2xl bg-white p-3 shadow-card dark:bg-zinc-900" key={index}><div className="aspect-square animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800"/><div className="mt-3 h-3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800"/><div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800"/></div>)}</div>;
}
