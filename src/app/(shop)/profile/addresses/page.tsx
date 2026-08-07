'use client';
/**
 * مدیریت آدرس‌ها — لیست، ایجاد، ویرایش، حذف، پیش‌فرض
 */
import { useState } from 'react';
import { MapPin, PenLine, Plus, Star, Trash2 } from 'lucide-react';
import { useAddresses, useDeleteAddress, useSetDefaultAddress } from '@/hooks/account';
import { AddressFormModal } from '@/components/checkout/address-form-modal';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/modal';
import { ListSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/states';
import { cn } from '@/utils/cn';
import type { AddressDto } from '@/types/account';

export default function AddressesPage() {
  const addresses = useAddresses();
  const del = useDeleteAddress();
  const setDefault = useSetDefaultAddress();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<AddressDto | null>(null);
  const [deleting, setDeleting] = useState<AddressDto | null>(null);

  const list = addresses.data?.data ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-lg font-black text-zinc-900 dark:text-white">
          <MapPin size={20} className="text-brand" /> آدرس‌های من
        </h1>
        <Button size="sm" onClick={() => { setEditing(null); setModal(true); }}>
          <Plus size={15} /> آدرس جدید
        </Button>
      </div>

      {addresses.isLoading && <ListSkeleton count={2} />}

      {addresses.data && list.length === 0 && (
        <EmptyState
          icon="cart"
          title="هنوز آدرسی ثبت نکرده‌اید"
          description="برای خرید سریع‌تر، آدرس تحویل خود را ثبت کنید."
          action={<Button size="sm" onClick={() => { setEditing(null); setModal(true); }}>افزودن آدرس</Button>}
        />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {list.map((a) => (
          <article
            key={a.id}
            className={cn(
              'relative rounded-2xl border bg-white p-5 dark:bg-zinc-900',
              a.isDefault ? 'border-teal-400 dark:border-teal-600' : 'border-zinc-200 dark:border-zinc-800',
            )}
          >
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-black text-zinc-800 dark:text-zinc-100">
                {a.title}
                {a.isDefault && (
                  <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-600 dark:bg-teal-500/15 dark:text-teal-300">پیش‌فرض</span>
                )}
              </h3>
              <div className="flex items-center gap-1">
                {!a.isDefault && (
                  <button
                    onClick={() => setDefault.mutate(a.id)}
                    className="rounded-full p-2 text-zinc-400 transition hover:bg-amber-50 hover:text-amber-500 dark:hover:bg-amber-500/10"
                    title="انتخاب به‌عنوان پیش‌فرض"
                  >
                    <Star size={15} />
                  </button>
                )}
                <button
                  onClick={() => { setEditing(a); setModal(true); }}
                  className="rounded-full p-2 text-zinc-400 transition hover:bg-sky-50 hover:text-sky-500 dark:hover:bg-sky-500/10"
                  title="ویرایش"
                >
                  <PenLine size={15} />
                </button>
                <button
                  onClick={() => setDeleting(a)}
                  className="rounded-full p-2 text-zinc-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                  title="حذف"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
            <p className="mt-3 text-xs leading-6 text-zinc-500 dark:text-zinc-400">
              {a.province?.name}، {a.city?.name}، {a.fullAddress}
            </p>
            <p className="mt-2 border-t border-dashed border-zinc-100 pt-2 text-[11px] text-zinc-400 dark:border-zinc-800">
              {a.receiverName} — <bdi dir="ltr">{a.receiverPhone}</bdi> — کد پستی {a.postalCode}
            </p>
          </article>
        ))}
      </div>

      <AddressFormModal open={modal} onClose={() => setModal(false)} address={editing} />
      <ConfirmDialog
        open={deleting != null}
        onClose={() => setDeleting(null)}
        onConfirm={() => { if (deleting) del.mutate(deleting.id); setDeleting(null); }}
        title="حذف آدرس"
        message={`آدرس «${deleting?.title}» برای همیشه حذف می‌شود. مطمئن هستید؟`}
        confirmText="حذف کن"
      />
    </div>
  );
}
