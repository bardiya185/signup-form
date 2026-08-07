'use client';
import { useCart, useCategories } from '@/hooks/api';
import { useAuthStore } from '@/stores/auth.store';
import { useUiStore } from '@/stores/ui.store';
import { faDigits } from '@/lib/format';
import { cn } from '@/utils/cn';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown, Flame, LayoutGrid, LogOut, MapPin, Menu, Moon, Package,
  Percent, ShoppingCart, Sun, Ticket, User, WalletCards, Bell,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { SearchBar } from './search-bar';
import { MobileMenu } from './mobile-menu';

function Logo() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2">
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand text-lg font-black text-white shadow-lg shadow-brand/30">گ</span>
      <span className="hidden text-lg font-black tracking-tight text-zinc-900 dark:text-white sm:block">
        گینان<span className="text-brand">‌کالا</span>
      </span>
    </Link>
  );
}

function MegaMenu() {
  const { data } = useCategories();
  const [open, setOpen] = useState(false);
  const [activeRoot, setActiveRoot] = useState<number | null>(null);
  const roots = data?.data ?? [];
  const active = roots.find((r) => r.id === (activeRoot ?? roots[0]?.id));

  return (
    <div className="relative hidden lg:block" onMouseLeave={() => setOpen(false)}>
      <button
        onMouseEnter={() => setOpen(true)}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 py-4 text-sm font-bold text-zinc-700 transition hover:text-brand dark:text-zinc-200"
      >
        <LayoutGrid size={17} />
        دسته‌بندی کالاها
        <ChevronDown size={14} className={cn('transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && roots.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 top-full z-50 flex w-[780px] overflow-hidden rounded-b-2xl border border-zinc-100 bg-white shadow-2xl shadow-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-900"
            onMouseEnter={() => setOpen(true)}
          >
            {/* ریشه‌ها */}
            <div className="w-56 shrink-0 border-l border-zinc-100 bg-zinc-50/60 py-2 dark:border-zinc-800 dark:bg-zinc-800/40">
              {roots.map((root) => (
                <Link
                  key={root.id}
                  href={`/category/${root.slug}`}
                  onClick={() => setOpen(false)}
                  onMouseEnter={() => setActiveRoot(root.id)}
                  className={cn(
                    'flex items-center justify-between px-4 py-2.5 text-[13px] transition',
                    active?.id === root.id
                      ? 'bg-white font-bold text-brand dark:bg-zinc-900'
                      : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-300',
                  )}
                >
                  {root.title}
                  {root.children.length > 0 && <ChevronDown size={13} className="-rotate-90" />}
                </Link>
              ))}
            </div>
            {/* زیرمجموعه‌ها */}
            <div className="flex-1 p-5">
              {active && (
                <>
                  <Link href={`/category/${active.slug}`} onClick={() => setOpen(false)} className="mb-3 block text-xs font-bold text-brand hover:underline">
                    همه کالاهای {active.title} ←
                  </Link>
                  <div className="grid grid-cols-3 gap-x-6 gap-y-1">
                    {(active.children.length ? active.children : [active]).map((child) => (
                      <div key={child.id} className="py-1">
                        <Link
                          href={`/category/${child.slug}`}
                          onClick={() => setOpen(false)}
                          className="mb-1.5 block border-r-2 border-brand pr-2 text-[13px] font-bold text-zinc-800 transition hover:text-brand dark:text-zinc-100"
                        >
                          {child.title}
                        </Link>
                        {child.children.map((gc) => (
                          <Link
                            key={gc.id}
                            href={`/category/${gc.slug}`}
                            onClick={() => setOpen(false)}
                            className="block py-0.5 pr-2 text-xs text-zinc-500 transition hover:text-brand dark:text-zinc-400"
                          >
                            {gc.title}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function UserMenu() {
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const logout = useAuthStore((s) => s.logout);
  const items = [
    { href: '/profile', label: 'پروفایل', icon: User },
    { href: '/profile/orders', label: 'سفارش‌های من', icon: Package },
    { href: '/profile/wallet', label: 'کیف پول', icon: WalletCards },
    { href: '/profile/notifications', label: 'اعلان‌ها', icon: Bell },
    { href: '/profile/tickets', label: 'تیکت‌های پشتیبانی', icon: Ticket },
    { href: '/profile/addresses', label: 'آدرس‌ها', icon: MapPin },
  ];

  if (!user) {
    return (
      <Link href="/login" className="flex h-10 items-center gap-1.5 rounded-xl border border-zinc-200 px-3.5 text-sm font-bold text-zinc-700 transition hover:border-brand hover:text-brand dark:border-zinc-700 dark:text-zinc-200 sm:px-4">
        <User size={17} />
        <span className="hidden sm:inline">ورود | ثبت‌نام</span>
        <span className="sm:hidden">ورود</span>
      </Link>
    );
  }

  return (
    <div className="relative" onMouseLeave={() => setOpen(false)}>
      <button
        onMouseEnter={() => setOpen(true)}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 items-center gap-2 rounded-xl px-2 text-sm font-bold text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft text-sm font-black text-brand dark:bg-brand/25 dark:text-red-300">
          {user.firstName?.[0] ?? 'ک'}
        </span>
        <span className="hidden max-w-[90px] truncate sm:block">{user.firstName} {user.lastName}</span>
        <ChevronDown size={13} className="hidden text-zinc-400 sm:block" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.14 }}
            className="absolute left-0 top-full z-50 w-56 overflow-hidden rounded-2xl border border-zinc-100 bg-white py-2 shadow-2xl shadow-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
              <p className="text-sm font-black text-zinc-900 dark:text-white">{user.fullName}</p>
              <p className="mt-0.5 text-xs text-zinc-500" dir="ltr">{user.phone}</p>
            </div>
            {items.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-zinc-600 transition hover:bg-zinc-50 hover:text-brand dark:text-zinc-300 dark:hover:bg-zinc-800">
                <item.icon size={16} className="text-zinc-400" />{item.label}
              </Link>
            ))}
            <button
              onClick={() => { setOpen(false); void logout(); }}
              className="flex w-full items-center gap-2.5 border-t border-zinc-100 px-4 py-2.5 text-[13px] text-red-500 transition hover:bg-red-50 dark:border-zinc-800 dark:hover:bg-red-500/10"
            >
              <LogOut size={16} /> خروج از حساب
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CartButton() {
  const { data } = useCart();
  const count = data?.data.totals.itemsCount ?? 0;
  return (
    <Link href="/cart" className="relative flex h-10 w-10 items-center justify-center rounded-xl text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800" aria-label="سبد خرید">
      <ShoppingCart size={21} />
      {count > 0 && (
        <span className="absolute -left-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-black text-white">
          {faDigits(count)}
        </span>
      )}
    </Link>
  );
}

export function Header() {
  const { theme, toggleTheme, setMobileMenu } = useUiStore();
  const pathname = usePathname();
  const quickLinks = [
    { href: '/incredible-offers', label: 'پیشنهاد شگفت‌انگیز', icon: Flame, hot: true },
    { href: '/products?has_discount=1&sort=highest_discount', label: 'تخفیف‌دارها', icon: Percent },
    { href: '/products?sort=best_selling', label: 'پرفروش‌ترین‌ها' },
    { href: '/seller-register', label: 'فروشنده شوید' },
    { href: '/faq', label: 'سوالی دارید؟' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-zinc-100 bg-white/95 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/90">
        <div className="container-page">
          {/* ردیف بالا */}
          <div className="flex items-center gap-3 border-b border-zinc-100 py-3 dark:border-zinc-800 lg:gap-6">
            <button onClick={() => setMobileMenu(true)} className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 lg:hidden" aria-label="منو">
              <Menu size={22} />
            </button>
            <Logo />
            <div className="min-w-0 flex-1"><SearchBar /></div>
            <div className="flex shrink-0 items-center gap-1.5">
              <button onClick={toggleTheme} className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800" aria-label="تغییر پوسته">
                {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
              </button>
              <div className="hidden h-6 w-px bg-zinc-200 dark:bg-zinc-700 sm:block" />
              <UserMenu />
              <CartButton />
            </div>
          </div>
          {/* ردیف ناوبری */}
          <nav className="flex items-center gap-5 overflow-x-auto py-0 lg:gap-7" aria-label="ناوبری اصلی">
            <MegaMenu />
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 whitespace-nowrap py-4 text-[13px] transition',
                  link.hot ? 'font-black text-brand' : 'font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white',
                  pathname === link.href && 'text-brand',
                )}
              >
                {link.icon && <link.icon size={15} className={link.hot ? 'text-brand' : ''} />}
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <MobileMenu />
    </>
  );
}
