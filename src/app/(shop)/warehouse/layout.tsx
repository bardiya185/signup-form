'use client';
import { ArrowLeftRight, Boxes, LayoutDashboard, PackageOpen, Truck } from 'lucide-react';
import { PanelShell } from '@/components/admin/panel-shell';

const NAV = [
  { href: '/warehouse', label: 'پیشخوان انبار', icon: LayoutDashboard, exact: true },
  { href: '/warehouse/inventory', label: 'موجودی انبار', icon: Boxes },
  { href: '/warehouse/shipments', label: 'مرسوله‌ها', icon: Truck },
  { href: '/warehouse/movements', label: 'گردش موجودی', icon: ArrowLeftRight },
];

export default function WarehouseLayout({ children }: { children: React.ReactNode }) {
  return (
    <PanelShell
      title="پنل انبارداری"
      subtitle="مدیریت موجودی و ارسال سفارش‌ها"
      icon={PackageOpen}
      accent="bg-amber-500"
      nav={NAV}
      allowedRoles={['warehouse', 'admin', 'super_admin']}
    >
      {children}
    </PanelShell>
  );
}
