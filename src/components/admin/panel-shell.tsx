'use client';
/**
 * پوسته مشترک پنل‌های مدیریت / فروشنده / انبار
 * — نگهبان نقش + سایدبار تیره + سربرگ
 */
import { useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowRight, Store, type LucideIcon } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { PageLoading } from '@/components/ui/states';
import { cn } from '@/utils/cn';

export interface PanelNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  badge?: number;
}

export function PanelShell({
  title,
  subtitle,
  icon: PanelIcon,
  accent,
  nav,
  allowedRoles,
  unauthorizedHint,
  children,
}: {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  accent: string; // رنگ تم پنل، مثل 'bg-brand'
  nav: PanelNavItem[];
  allowedRoles: string[];
  unauthorizedHint?: ReactNode;
  children: ReactNode;
}) {
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);
  const pathname = usePathname();
  const router = useRouter();

  const allowed = !!user && allowedRoles.includes(user.role);

  useEffect(() => {
    if (initialized && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [initialized, user, pathname, router]);

  if (!initialized || !user) return <PageLoading />;

  if (!allowed) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center gap-4 py-16 text-center">
        <div className={cn('flex size-16 items-center justify-center rounded-2xl text-white', accent)}>
          <PanelIcon size={30} />
        </div>
        <h1 className="text-lg font-black text-zinc-900 dark:text-white">دسترسی به این بخش ندارید</h1>
        <p className="max-w-sm text-sm leading-7 text-zinc-500 dark:text-zinc-400">
          {unauthorizedHint ?? 'این بخش فقط برای کاربران مجاز فعال است. اگر فکر می‌کنید باید دسترسی داشته باشید با پشتیبانی تماس بگیرید.'}
        </p>
        <Link href="/" className="flex items-center gap-1.5 text-sm font-bold text-sky-600 dark:text-sky-400">
          <ArrowRight size={15} /> بازگشت به فروشگاه
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-zinc-100/70 dark:bg-zinc-950">
      <div className="container-page py-6">
        <div className="grid items-start gap-6 lg:grid-cols-[250px_1fr]">
          {/* سایدبار */}
          <aside className="overflow-hidden rounded-2xl bg-zinc-900 text-zinc-300 shadow-xl dark:border dark:border-white/10 lg:sticky lg:top-24">
            <div className="flex items-center gap-3 border-b border-white/10 p-5">
              <span className={cn('flex size-11 shrink-0 items-center justify-center rounded-xl text-white shadow-lg', accent)}>
                <PanelIcon size={20} />
              </span>
              <div>
                <p className="text-sm font-black text-white">{title}</p>
                <p className="mt-0.5 text-[11px] text-zinc-400">{subtitle}</p>
              </div>
            </div>
            <nav className="space-y-1 p-3">
              {nav.map(({ href, label, icon: Icon, exact, badge }) => {
                const active = exact ? pathname === href : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-4 py-2.5 text-[13px] font-bold transition',
                      active ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white',
                    )}
                  >
                    <Icon size={17} />
                    {label}
                    {!!badge && (
                      <span className="ms-auto rounded-full bg-brand px-2 py-0.5 text-[10px] font-black text-white">
                        {badge > 99 ? '+۹۹' : badge.toLocaleString('fa-IR')}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-white/10 p-3">
              <Link
                href="/"
                className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-[13px] font-bold text-zinc-400 transition hover:bg-white/5 hover:text-white"
              >
                <Store size={17} /> بازگشت به فروشگاه
              </Link>
            </div>
          </aside>

          {/* محتوا */}
          <div className="min-w-0 pb-10">{children}</div>
        </div>
      </div>
    </div>
  );
}

/** کارت محتوای استاندارد داخل پنل‌ها */
export const panelCard = 'rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900';

/** سربرگ صفحه داخلی پنل */
export function PanelTitle({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-lg font-black text-zinc-900 dark:text-white">{title}</h1>
        {description && <p className="mt-1 text-xs text-zinc-400">{description}</p>}
      </div>
      {action}
    </div>
  );
}
