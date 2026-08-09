'use client';
import {
  Award, ChartColumn, CreditCard, FolderTree, Headset, Image as ImageIcon,
  LayoutDashboard, MessageSquare, Package, ScrollText, Settings, ShieldCheck,
  ShoppingBag, Store, TicketPercent, Flame, Users,
} from 'lucide-react';
import { PanelShell } from '@/components/admin/panel-shell';

const NAV = [
  { href: '/admin', label: 'پیشخوان', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'محصولات', icon: Package },
  { href: '/admin/categories', label: 'دسته‌بندی‌ها', icon: FolderTree },
  { href: '/admin/brands', label: 'برندها', icon: Award },
  { href: '/admin/orders', label: 'سفارش‌ها', icon: ShoppingBag },
  { href: '/admin/users', label: 'کاربران', icon: Users },
  { href: '/admin/sellers', label: 'فروشندگان', icon: Store },
  { href: '/admin/coupons', label: 'کوپن‌های تخفیف', icon: TicketPercent },
  { href: '/admin/offers', label: 'پیشنهادهای ویژه', icon: Flame },
  { href: '/admin/reviews', label: 'دیدگاه‌ها', icon: MessageSquare },
  { href: '/admin/banners', label: 'بنرها', icon: ImageIcon },
  { href: '/admin/payments', label: 'پرداخت‌ها', icon: CreditCard },
  { href: '/admin/tickets', label: 'تیکت‌های پشتیبانی', icon: Headset },
  { href: '/admin/reports', label: 'گزارش‌ها', icon: ChartColumn },
  { href: '/admin/settings', label: 'تنظیمات فروشگاه', icon: Settings },
  { href: '/admin/logs', label: 'لاگ فعالیت', icon: ScrollText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <PanelShell
      title="پنل مدیریت"
      subtitle="کنترل کامل فروشگاه"
      icon={ShieldCheck}
      accent="bg-brand"
      nav={NAV}
      allowedRoles={['admin', 'super_admin']}
    >
      {children}
    </PanelShell>
  );
}
