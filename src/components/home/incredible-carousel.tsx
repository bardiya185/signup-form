'use client';
import type { IncredibleOfferDto } from '@/types/dto';
import { faPercent, faDigits } from '@/lib/format';
import { CountdownTimer } from '@/components/ui/countdown';
import { PriceDisplay } from '@/components/ui/price';
import { ArrowLeft, Flame } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function IncredibleCarousel({ offers, endsAt }: { offers: IncredibleOfferDto[]; endsAt: string | null }) {
  if (!offers.length) return null;
  return (
    <section className="container-page pt-10">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-l from-brand via-[#e2344a] to-rose-500 p-1 shadow-xl shadow-brand/20 dark:shadow-none">
        <div className="rounded-[22px] bg-gradient-to-l from-brand to-rose-500 p-5 sm:p-6">
          {/* هدر */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur">
                <Flame size={22} />
              </span>
              <div>
                <h2 className="text-lg font-black text-white sm:text-xl">پیشنهاد شگفت‌انگیز</h2>
                <p className="text-[11px] text-white/70">تخفیف‌های محدود تا پایان مهلت</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {endsAt && <CountdownTimer target={endsAt} light />}
              <Link href="/incredible-offers" className="flex items-center gap-1 rounded-xl bg-white/15 px-3 py-2 text-xs font-bold text-white backdrop-blur transition hover:bg-white/25">
                مشاهده همه <ArrowLeft size={13} />
              </Link>
            </div>
          </div>

          {/* کارت‌ها */}
          <div className="scrollbar-none -mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1">
            {offers.map((offer) => (
              <Link
                key={offer.id}
                href={`/products/${offer.product.slug}`}
                className="group w-[46%] shrink-0 snap-start rounded-2xl bg-white p-3 transition-transform duration-300 hover:-translate-y-1 dark:bg-zinc-900 sm:w-[31%] lg:w-[23%] xl:w-[18.7%]"
              >
                <div className="relative aspect-square overflow-hidden rounded-xl bg-zinc-50 dark:bg-zinc-800">
                  <Image
                    src={offer.product.image}
                    alt={offer.product.title}
                    fill
                    sizes="(max-width: 640px) 45vw, 18vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute right-2 top-2 rounded-full bg-brand px-2 py-0.5 text-[11px] font-black text-white shadow">
                    {faPercent(offer.discountPercentage)}
                  </span>
                </div>
                <h3 className="mt-2.5 line-clamp-2 min-h-[2.6rem] text-[12px] leading-5 text-zinc-700 dark:text-zinc-200">
                  {offer.product.title}
                </h3>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div className="h-full rounded-full bg-gradient-to-l from-brand to-rose-400 transition-all" style={{ width: `${offer.soldPercent}%` }} />
                  </div>
                  <span className="shrink-0 text-[10px] font-bold text-brand">٪{faDigits(offer.soldPercent)}</span>
                </div>
                <div className="mt-2 flex justify-end">
                  <PriceDisplay price={offer.product.effectivePrice} originalPrice={offer.product.price} discountPercent={0} size="sm" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
