'use client';
import { ChartColumn, LayoutDashboard, Package, PackagePlus, ScrollText, ShoppingBag, Store, Wallet } from 'lucide-react';
import { PanelShell } from '@/components/admin/panel-shell';

const NAV = [
  { href: '/seller', label: 'پیشخوان فروشنده', icon: LayoutDashboard, exact: true },
  { href: '/seller/products', label: 'کالاهای من', icon: Package },
  { href: '/seller/products/new', label: 'ثبت کالای جدید', icon: PackagePlus },
  { href: '/seller/orders', label: 'فروش‌های من', icon: ShoppingBag },
  { href: '/seller/settlements', label: 'تسویه‌حساب‌ها', icon: Wallet },
  { href: '/seller/analytics', label: 'گزارش عملکرد', icon: ChartColumn },
  { href: '/seller-register', label: 'ویرایش درخواست فروشندگی', icon: ScrollText },
];

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <PanelShell
      title="پنل فروشندگی"
      subtitle="مدیریت کالا و فروش"
      icon={Store}
      accent="bg-emerald-600"
      nav={NAV}
      allowedRoles={['seller']}
      unauthorizedHint="این بخش فقط برای فروشندگان تاییدشده فعال است. اگر هنوز درخواست فروشندگی نداده‌اید، از صفحه «فروشنده شوید» ثبت‌نام کنید و منتظر تایید مدیر بمانید."
    >
      {children}
    </PanelShell>
  );
}
