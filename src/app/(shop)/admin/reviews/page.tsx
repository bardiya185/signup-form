'use client';
/**
 * نظارت بر دیدگاه‌ها — تایید / رد / حذف
 */
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Trash2, XCircle } from 'lucide-react';
import { useAdminModerateReview, useAdminReviews } from '@/hooks/admin';
import { PanelTitle } from '@/components/admin/panel-shell';
import { FilterPills, Pagination, Td, Tr, DataTable } from '@/components/admin/data-table';
import { StarRating } from '@/components/ui/rating';
import { Badge } from '@/components/ui/badge';
import { faDigits, jdatetime } from '@/lib/format';

function ReviewsInner() {
  const sp = useSearchParams();
  const [status, setStatus] = useState<string | undefined>(sp.get('status') ?? 'pending');
  const [page, setPage] = useState(1);
  const reviews = useAdminReviews(status, page);
  const moderate = useAdminModerateReview();
  const rows = reviews.data?.data ?? [];

  return (
    <div>
      <PanelTitle title="نظارت بر دیدگاه‌ها" description="دیدگاه‌های کاربران پس از تایید در سایت نمایش داده می‌شوند" />

      <div className="mb-4">
        <FilterPills
          options={[
            { value: 'pending', label: 'در انتظار تایید' },
            { value: 'approved', label: 'تایید شده' },
            { value: 'rejected', label: 'رد شده' },
          ]}
          value={status}
          onChange={(v) => { setStatus(v); setPage(1); }}
          allLabel="همه"
        />
      </div>

      <DataTable
        head={['دیدگاه', 'محصول', 'نویسنده', 'امتیاز', 'وضعیت', 'تاریخ', 'عملیات']}
        loading={reviews.isLoading}
        empty={rows.length === 0}
        emptyTitle="دیدگاهی با این وضعیت وجود ندارد"
      >
        {rows.map((r) => (
          <Tr key={r.id}>
            <Td>
              <p className="max-w-64 truncate font-bold text-zinc-800 dark:text-zinc-100">{r.title}</p>
              <p className="mt-0.5 line-clamp-1 max-w-64 text-[11px] text-zinc-400">{r.body}</p>
            </Td>
            <Td>
              <Link href={`/products/${r.productId}`} className="line-clamp-1 max-w-44 text-sky-600 hover:underline dark:text-sky-400">
                {r.productTitle}
              </Link>
            </Td>
            <Td>
              {r.authorName}
              {r.isBuyer && <Badge tone="green" className="ms-1.5">خریدار</Badge>}
            </Td>
            <Td><StarRating value={r.rating} size={12} showValue={false} /></Td>
            <Td>
              <Badge tone={r.status === 'approved' ? 'green' : r.status === 'pending' ? 'amber' : 'red'}>
                {r.status === 'approved' ? 'تایید شده' : r.status === 'pending' ? 'در انتظار' : 'رد شده'}
              </Badge>
            </Td>
            <Td className="text-zinc-400">{jdatetime(r.createdAt)}</Td>
            <Td>
              <div className="flex items-center gap-1">
                {r.status !== 'approved' && (
                  <button
                    onClick={() => moderate.mutate({ id: r.id, action: 'approve' })}
                    disabled={moderate.isPending}
                    className="rounded-lg p-1.5 text-emerald-600 transition hover:bg-emerald-50 dark:hover:bg-emerald-500/10" title="تایید"
                  >
                    <CheckCircle2 size={16} />
                  </button>
                )}
                {r.status !== 'rejected' && (
                  <button
                    onClick={() => moderate.mutate({ id: r.id, action: 'reject' })}
                    disabled={moderate.isPending}
                    className="rounded-lg p-1.5 text-amber-500 transition hover:bg-amber-50 dark:hover:bg-amber-500/10" title="رد"
                  >
                    <XCircle size={16} />
                  </button>
                )}
                <button
                  onClick={() => moderate.mutate({ id: r.id, action: 'delete' })}
                  disabled={moderate.isPending}
                  className="rounded-lg p-1.5 text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/10" title="حذف"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </Td>
          </Tr>
        ))}
      </DataTable>

      {reviews.data && <Pagination page={page} lastPage={reviews.data.meta.last_page} onChange={setPage} />}
      <p className="mt-3 text-center text-[10px] text-zinc-400">{faDigits(reviews.data?.meta.total ?? 0)} دیدگاه</p>
    </div>
  );
}

export default function AdminReviewsPage() {
  return <Suspense><ReviewsInner /></Suspense>;
}
