'use client';
import { useCategories } from '@/hooks/api';
import { useAuthStore } from '@/stores/auth.store';
import { useUiStore } from '@/stores/ui.store';
import { cn } from '@/utils/cn';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Flame, Home, LogOut, Package, User, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

function CategoryAccordion({ onNavigate }: { onNavigate: () => void }) {
  const { data } = useCategories();
  const [expanded, setExpanded] = useState<number | null>(null);
  return (
    <div>
      {(data?.data ?? []).map((root) => (
        <div key={root.id} className="border-b border-zinc-100 dark:border-zinc-800">
          <button
            onClick={() => setExpanded(expanded === root.id ? null : root.id)}
            className="flex w-full items-center justify-between py-3.5 text-sm font-bold text-zinc-700 dark:text-zinc-200"
          >
            {root.title}
            {root.children.length > 0 && (
              <ChevronDown size={16} className={cn('text-zinc-400 transition-transform', expanded === root.id && 'rotate-180')} />
            )}
          </button>
          <AnimatePresence initial={false}>
            {expanded === root.id && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <Link href={`/category/${root.slug}`} onClick={onNavigate} className="block pb-2 pr-2 text-xs font-bold text-brand">همه موارد {root.title}</Link>
                {root.children.map((child) => (
                  <Link key={child.id} href={`/category/${child.slug}`} onClick={onNavigate} className="block py-2 pr-4 text-sm text-zinc-500 dark:text-zinc-400">
                    {child.title}
                  </Link>
                ))}
                <div className="pb-2" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

export function MobileMenu() {
  const { mobileMenuOpen, setMobileMenu } = useUiStore();
  const { user } = useAuthStore();
  const logout = useAuthStore((s) => s.logout);
  const close = () => setMobileMenu(false);

  return (
    <AnimatePresence>
      {mobileMenuOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/45 backdrop-blur-sm lg:hidden"
            onClick={close}
          />
          <motion.aside
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-[85] flex w-[85%] max-w-sm flex-col bg-white shadow-2xl dark:bg-zinc-950 lg:hidden"
          >
            <div className="flex items-center justify-between border-b border-zinc-100 p-4 dark:border-zinc-800">
              <span className="text-base font-black text-zinc-900 dark:text-white">گینان<span className="text-brand">‌کالا</span></span>
              <button onClick={close} aria-label="بستن" className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-4">
              <div className="space-y-1 border-b border-zinc-100 py-3 dark:border-zinc-800">
                <Link href="/" onClick={close} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800"><Home size={17} className="text-zinc-400" /> صفحه اصلی</Link>
                <Link href="/incredible-offers" onClick={close} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold text-brand hover:bg-brand-soft dark:hover:bg-brand/15"><Flame size={17} /> پیشنهاد شگفت‌انگیز</Link>
                {user ? (
                  <Link href="/profile/orders" onClick={close} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800"><Package size={17} className="text-zinc-400" /> سفارش‌های من</Link>
                ) : (
                  <Link href="/login" onClick={close} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold text-brand hover:bg-brand-soft dark:hover:bg-brand/15"><User size={17} /> ورود | ثبت‌نام</Link>
                )}
              </div>
              <p className="pb-1 pt-4 text-xs font-bold text-zinc-400">دسته‌بندی‌ها</p>
              <CategoryAccordion onNavigate={close} />
            </div>
            {user && (
              <div className="border-t border-zinc-100 p-4 dark:border-zinc-800">
                <button onClick={() => { close(); void logout(); }} className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 py-3 text-sm font-bold text-red-500 dark:bg-red-500/10">
                  <LogOut size={16} /> خروج از حساب
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
