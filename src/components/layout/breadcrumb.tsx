import { ChevronLeft, Home } from 'lucide-react';
import Link from 'next/link';

export interface Crumb { title: string; href?: string }

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="مسیر صفحه" className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
      <Link href="/" className="flex items-center gap-1 transition hover:text-brand">
        <Home size={13} /> گینان‌کالا
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronLeft size={13} className="text-zinc-300 dark:text-zinc-600" />
          {item.href && i < items.length - 1 ? (
            <Link href={item.href} className="transition hover:text-brand">{item.title}</Link>
          ) : (
            <span className="font-medium text-zinc-700 dark:text-zinc-200">{item.title}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
