'use client';
/**
 * مدیریت کاربران — جستجو/فیلتر نقش و وضعیت + فعال/مسدود
 */
import { useState } from 'react';
import { Ban, CheckCircle2 } from 'lucide-react';
import { useAdminUpdateUserStatus, useAdminUsers } from '@/hooks/admin';
import { useAuthStore } from '@/stores/auth.store';
import { PanelTitle } from '@/components/admin/panel-shell';
import { DataTable, FilterPills, Pagination, TableToolbar, Td, Tr } from '@/components/admin/data-table';
import { Badge } from '@/components/ui/badge';
import { faDigits, formatPrice, jdate } from '@/lib/format';

const ROLE_FA: Record<string, string> = {
  customer: 'مشتری', seller: 'فروشنده', admin: 'مدیر', super_admin: 'مدیر ارشد', warehouse: 'انباردار',
};
const roleTone = (r: string) =>
  r === 'super_admin' ? 'red' : r === 'admin' ? 'purple' : r === 'seller' ? 'blue' : r === 'warehouse' ? 'amber' : 'zinc';

export default function AdminUsersPage() {
  const me = useAuthStore((s) => s.user);
  const [q, setQ] = useState('');
  const [role, setRole] = useState<string | undefined>();
  const [status, setStatus] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const users = useAdminUsers({ q: q || undefined, role, status, page });
  const updateStatus = useAdminUpdateUserStatus();

  const rows = users.data?.data ?? [];

  return (
    <div>
      <PanelTitle title="مدیریت کاربران" description={`${faDigits(users.data?.meta.total ?? 0)} کاربر`} />

      <TableToolbar search={q} onSearch={(v) => { setQ(v); setPage(1); }} placeholder="نام، موبایل یا ایمیل…">
        <FilterPills
          options={[
            { value: 'customer', label: 'مشتری' }, { value: 'seller', label: 'فروشنده' },
            { value: 'warehouse', label: 'انباردار' }, { value: 'admin', label: 'مدیر' },
          ]}
          value={role}
          onChange={(v) => { setRole(v); setPage(1); }}
          allLabel="همه نقش‌ها"
        />
        <FilterPills
          options={[{ value: 'active', label: 'فعال' }, { value: 'banned', label: 'مسدود' }]}
          value={status}
          onChange={(v) => { setStatus(v); setPage(1); }}
          allLabel="هر وضعیت"
        />
      </TableToolbar>

      <DataTable
        head={['کاربر', 'تماس', 'نقش', 'سفارش‌ها', 'مجموع خرید', 'عضویت', 'وضعیت', 'عملیات']}
        loading={users.isLoading}
        empty={rows.length === 0}
      >
        {rows.map((u) => (
          <Tr key={u.id}>
            <Td>
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-black text-zinc-500 dark:bg-zinc-800">
                  {u.firstName?.[0]}
                </span>
                <span className="font-bold text-zinc-800 dark:text-zinc-100">{u.fullName}</span>
              </div>
            </Td>
            <Td>
              <p dir="ltr" className="font-mono text-[11px]">{u.phone}</p>
              <p dir="ltr" className="mt-0.5 font-mono text-[10px] text-zinc-400">{u.email ?? '—'}</p>
            </Td>
            <Td><Badge tone={roleTone(u.role)}>{ROLE_FA[u.role] ?? u.role}</Badge></Td>
            <Td>{faDigits(u.ordersCount)}</Td>
            <Td className="font-bold text-zinc-800 dark:text-zinc-100">{formatPrice(u.totalSpent)}</Td>
            <Td className="text-zinc-400">{jdate(u.createdAt, 'medium')}</Td>
            <Td>
              <Badge tone={u.status === 'active' ? 'green' : 'red'}>{u.statusFa}</Badge>
            </Td>
            <Td>
              {u.id === me?.id ? (
                <span className="text-[10px] text-zinc-300 dark:text-zinc-600">حساب خود شما</span>
              ) : u.status === 'active' ? (
                <button
                  onClick={() => updateStatus.mutate({ id: u.id, status: 'banned' })}
                  disabled={updateStatus.isPending}
                  className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  <Ban size={13} /> مسدودسازی
                </button>
              ) : (
                <button
                  onClick={() => updateStatus.mutate({ id: u.id, status: 'active' })}
                  disabled={updateStatus.isPending}
                  className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-emerald-600 transition hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                >
                  <CheckCircle2 size={13} /> فعال‌سازی
                </button>
              )}
            </Td>
          </Tr>
        ))}
      </DataTable>

      {users.data && <Pagination page={page} lastPage={users.data.meta.last_page} onChange={setPage} />}
    </div>
  );
}
