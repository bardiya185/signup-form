'use client';
/**
 * پوسته صفحات احراز هویت — کارت مینیمال با لوگو و ریدایرکت کاربر لاگین
 */
import { useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
}) {
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);
  const router = useRouter();

  useEffect(() => {
    if (initialized && user) router.replace('/profile');
  }, [initialized, user, router]);

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-10">
      <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-7 shadow-xl shadow-zinc-200/40 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/30 sm:p-9">
        <Link href="/" className="mx-auto mb-6 block w-fit text-2xl font-black tracking-tight text-brand">
          گینان‌کالا
        </Link>
        <h1 className="text-center text-lg font-black text-zinc-900 dark:text-white">{title}</h1>
        {subtitle && <p className="mt-2 text-center text-xs leading-6 text-zinc-400">{subtitle}</p>}
        <div className="mt-7">{children}</div>
      </div>
    </div>
  );
}
