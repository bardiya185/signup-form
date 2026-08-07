'use client';
/**
 * پوسته پنل کاربری — نگهبان احراز هویت + سایدبار ناوبری
 */
import { useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell, Heart, House, LogOut, MapPin, MessageSquareText, Package, Settings, ShieldCheck, Store, Wallet,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { faDigits, formatPrice, jdate } from '@/lib/format';
import { cn } from '@/utils/cn';
import { PageLoading } from '@/components/ui/states';

const NAV = [
  { href: '/profile', label: 'پیشخوان', icon: House, exact: true },
  { href: '/profile/orders', label: 'سفارش‌های من', icon: Package },
  { href: '/profile/addresses', label: 'آدرس‌ها', icon: MapPin },
  { href: '/profile/wishlist', label: 'علاقه‌مندی‌ها', icon: Heart, counter: 'wishlist' as const },
  { href: '/profile/wallet', label: 'کیف پول', icon: Wallet, counter: 'wallet' as const },
  { href: '/profile/notifications', label: 'اعلان‌ها', icon: Bell, counter: 'notifications' as const },
  { href: '/profile/tickets', label: 'تیکت‌های پشتیبانی', icon: MessageSquareText },
];

export function ProfileShell({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);
  const counters = useAuthStore((s) => s.counters);
  const logout = useAuthStore((s) => s.logout);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (initialized && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [initialized, user, pathname, router]);

  if (!initialized || !user) return <PageLoading />;

  const badge = (key?: 'wishlist' | 'wallet' | 'notifications') => {
    if (!key) return null;
    const v = counters[key];
    if (!v) return null;
    return (
      <span className="ms-auto rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-black text-brand dark:bg-brand/15">
        {key === 'wallet' ? `${formatPrice(v)} ت` : faDigits(v)}
      </span>
    );
  };

  const linkCls = (active: boolean) =>
    cn(
      'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition',
      active
        ? 'bg-brand-soft text-brand dark:bg-brand/15'
        : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100',
    );

  return (
    <div className="container-page py-8">
      <div className="grid items-start gap-6 lg:grid-cols-[280px_1fr]">
        {/* سایدبار */}
        <aside className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 lg:sticky lg:top-24">
          <div className="flex items-center gap-3 border-b border-zinc-100 p-5 dark:border-zinc-800">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-soft text-lg font-black text-brand dark:bg-brand/15">
              {user.firstName?.[0] ?? '؟'}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-zinc-900 dark:text-white">{user.fullName}</p>
              <p className="mt-0.5 text-[11px] text-zinc-400" dir="ltr">{user.phone}</p>
            </div>
          </div>

          <nav className="space-y-1 p-3">
            {NAV.map(({ href, label, icon: Icon, exact, counter }) => (
              <Link key={href} href={href} className={linkCls(exact ? pathname === href : pathname.startsWith(href))}>
                <Icon size={17} />
                {label}
                {badge(counter)}
              </Link>
            ))}

            {user.role === 'seller' && (
              <Link href="/seller" className={linkCls(false)}>
                <Store size={17} /> پنل فروشندگی
              </Link>
            )}
            {user.role === 'admin' && (
              <Link href="/admin" className={linkCls(false)}>
                <ShieldCheck size={17} /> پنل مدیریت
              </Link>
            )}
            {user.role === 'customer' && (
              <Link href="/seller-register" className={linkCls(false)}>
                <Store size={17} /> فروشنده شوید
              </Link>
            )}

            <Link href="/profile/settings" className={linkCls(pathname.startsWith('/profile/settings'))}>
              <Settings size={17} /> ویرایش حساب کاربری
            </Link>
            <button
              onClick={() => { void logout().then(() => router.replace('/')); }}
              className={cn(linkCls(false), 'w-full text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10')}
            >
              <LogOut size={17} /> خروج از حساب
            </button>
          </nav>

          <p className="border-t border-zinc-100 p-4 text-center text-[10px] text-zinc-300 dark:border-zinc-800 dark:text-zinc-600">
            عضو گینان‌کالا از {jdate(user.createdAt ?? null, 'medium')}
          </p>
        </aside>

        {/* محتوا */}
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
