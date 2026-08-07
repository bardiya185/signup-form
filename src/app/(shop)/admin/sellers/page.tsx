'use client';
/**
 * مدیریت فروشندگان — تایید/تعلیق با دردسر کم
 */
import { Ban, CheckCircle2, Star } from 'lucide-react';
import { useAdminSetSellerStatus, useAdminSellers } from '@/hooks/admin';
import { PanelTitle } from '@/components/admin/panel-shell';
import { DataTable, Td, Tr } from '@/components/admin/data-table';
import { Badge } from '@/components/ui/badge';
import { faDigits, formatPrice, jdate } from '@/lib/format';

export default function AdminSellersPage() {
  const sellers = useAdminSellers();
  const setStatus = useAdminSetSellerStatus();
  const rows = sellers.data?.data ?? [];

  return (
    <div>
      <PanelTitle title="فروشندگان مارکت‌پلیس" description="تایید، تعلیق و نظارت بر عملکرد فروشندگان" />

      <DataTable
        head={['فروشگاه', 'مالک / تماس', 'کمیسیون', 'محصولات', 'امتیاز', 'عضویت', 'وضعیت', 'عملیات']}
        loading={sellers.isLoading}
        empty={rows.length === 0}
      >
        {rows.map((s) => (
          <Tr key={s.id}>
            <Td>
              <p className="font-bold text-zinc-800 dark:text-zinc-100">{s.shopName}</p>
              <p className="mt-0.5 font-mono text-[10px] text-zinc-400" dir="ltr">{s.slug}</p>
            </Td>
            <Td>
              <p>{s.ownerName}</p>
              <p className="font-mono text-[10px] text-zinc-400" dir="ltr">{s.phone}</p>
            </Td>
            <Td>{faDigits(s.commissionRate)}٪</Td>
            <Td>{faDigits(s.productsCount)}</Td>
            <Td>
              <span className="flex items-center gap-1 font-bold text-amber-500">
                <Star size={13} className="fill-amber-400" /> {faDigits(s.rating)}
              </span>
            </Td>
            <Td className="text-zinc-400">{jdate(s.createdAt, 'medium')}</Td>
            <Td>
              <Badge tone={s.status === 'approved' ? 'green' : s.status === 'pending' ? 'amber' : 'red'}>{s.statusFa}</Badge>
            </Td>
            <Td>
              <div className="flex gap-1">
                {s.status !== 'approved' && (
                  <button
                    onClick={() => setStatus.mutate({ id: s.id, status: 'approved' })}
                    disabled={setStatus.isPending}
                    className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-emerald-600 transition hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                  >
                    <CheckCircle2 size={13} /> تایید
                  </button>
                )}
                {s.status !== 'suspended' && (
                  <button
                    onClick={() => setStatus.mutate({ id: s.id, status: 'suspended', reason: 'تعلیق توسط مدیریت' })}
                    disabled={setStatus.isPending}
                    className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/10"
                  >
                    <Ban size={13} /> تعلیق
                  </button>
                )}
              </div>
            </Td>
          </Tr>
        ))}
      </DataTable>
    </div>
  );
}
