'use client';
/**
 * صفحه پیشنهاد شگفت‌انگیز — تایمر + گرید آفرها با نوار پیشرفت فروش
 */
import Link from 'next/link';
import Image from 'next/image';
import { Flame } from 'lucide-react';
import { useIncredibleOffers } from '@/hooks/api';
import { CountdownTimer } from '@/components/ui/countdown';
import { PriceDisplay } from '@/components/ui/price';
import { StarRating } from '@/components/ui/rating';
import { EmptyState } from '@/components/ui/states';
import { ListSkeleton } from '@/components/ui/skeleton';
import { faDigits, faPercent } from '@/lib/format';

export default function IncredibleOffersPage() {
  const offers = useIncredibleOffers();
  const items = offers.data?.data.offers ?? [];
  const endsAt = offers.data?.data.endsAt;

  return (
    <div>
      {/* هدر قرمز */}
      <section className="bg-gradient-to-l from-brand via-rose-500 to-brand py-12 text-white">
        <div className="container-page flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-white/15">
              <Flame size={30} />
            </span>
            <div>
              <h1 className="text-2xl font-black">پیشنهاد شگفت‌انگیز</h1>
              <p className="mt-1 text-sm opacity-85">تخفیف‌های باورنکردنی با موجودی محدود — هر روز به‌روز می‌شود</p>
            </div>
          </div>
          {endsAt && (
            <div className="rounded-2xl bg-white/10 px-5 py-3 backdrop-blur">
              <p className="mb-2 text-center text-[11px] opacity-85">فرصت باقی‌مانده</p>
              <CountdownTimer target={endsAt} light className="scale-125" />
            </div>
          )}
        </div>
      </section>

      <div className="container-page py-10">
        {offers.isLoading && <ListSkeleton count={8} />}

        {offers.data && items.length === 0 && (
          <EmptyState
            icon="product"
            title="فعلاً پیشنهاد شگفت‌انگیزی فعال نیست"
            description="هر روز پیشنهادهای جدید جایگزین می‌شوند؛ دوباره سر بزنید."
          />
        )}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((offer) => {
            const p = offer.product;
            const price = Math.round(p.effectivePrice);
            return (
              <Link
                key={offer.id}
                href={`/products/${p.slug}`}
                className="group flex flex-col rounded-2xl border border-zinc-200 bg-white p-4 transition hover:-translate-y-1 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="relative mb-3 aspect-square overflow-hidden rounded-xl bg-zinc-50 dark:bg-zinc-800">
                  <Image src={p.image} alt={p.title} fill className="object-contain p-3 transition duration-300 group-hover:scale-105" sizes="240px" />
                  <span className="absolute right-2 top-2 rounded-full bg-brand px-2 py-0.5 text-xs font-black text-white">
                    {faPercent(offer.discountPercentage)}
                  </span>
                </div>
                <h3 className="line-clamp-2 min-h-11 text-xs font-bold leading-5 text-zinc-800 dark:text-zinc-100">{p.title}</h3>
                {p.rating > 0 && <StarRating value={p.rating} count={p.reviewCount} size={12} className="mt-1.5" />}

                <div className="mt-auto pt-3">
                  <div className="flex items-end justify-between">
                    <PriceDisplay price={price} originalPrice={p.price > price ? p.price : undefined} size="sm" />
                    {p.stock <= 5 && p.stock > 0 && (
                      <span className="text-[10px] font-bold text-brand">تنها {faDigits(p.stock)} عدد مانده</span>
                    )}
                  </div>
                  {/* پیشرفت فروش */}
                  <div className="mt-2.5">
                    <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div className="h-full rounded-full bg-gradient-to-l from-brand to-rose-400" style={{ width: `${offer.soldPercent}%` }} />
                    </div>
                    <p className="mt-1 text-[10px] text-zinc-400">{faDigits(offer.soldPercent)}٪ فروخته شده</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
