'use client';
/**
 * نمودار تغییرات قیمت تنوع — SVG سبک بدون وابستگی
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp } from 'lucide-react';
import { http, type Envelope } from '@/lib/http';
import { faDigits, formatPrice, jdate } from '@/lib/format';
import { cn } from '@/utils/cn';
import { Modal } from '@/components/ui/modal';

interface ChartRow {
  variantId: number;
  sku: string;
  currentPrice: number;
  points: { date: string; price: number }[];
}

function Spark({ points }: { points: { date: string; price: number }[] }) {
  if (points.length < 2) return <p className="text-xs text-zinc-400">داده کافی برای رسم نمودار وجود ندارد.</p>;
  const W = 600; const H = 200; const PAD = 28;
  const prices = points.map((p) => p.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const span = Math.max(1, max - min);
  const xs = (i: number) => PAD + (i * (W - PAD * 2)) / (points.length - 1);
  const ys = (p: number) => H - PAD - ((p - min) / span) * (H - PAD * 2);
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${xs(i)},${ys(p.price)}`).join(' ');
  const area = `${d} L${xs(points.length - 1)},${H - PAD} L${xs(0)},${H - PAD} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="نمودار قیمت">
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef4056" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#ef4056" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#chartFill)" />
      <path d={d} fill="none" stroke="#ef4056" strokeWidth="2.5" strokeLinecap="round" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={xs(i)} cy={ys(p.price)} r="4" fill="#fff" stroke="#ef4056" strokeWidth="2" />
          <text x={xs(i)} y={ys(p.price) - 10} textAnchor="middle" className="fill-zinc-500 text-[11px] font-bold">
            {formatPrice(p.price)}
          </text>
          <text x={xs(i)} y={H - 8} textAnchor="middle" className="fill-zinc-400 text-[10px]">
            {jdate(p.date, 'medium')}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function PriceChartButton({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ['price-chart', slug],
    queryFn: () => http.get<Envelope<ChartRow[]>>(`/products/${slug}/price-chart`),
    enabled: open,
  });
  const rows = data?.data.filter((r) => r.points.length > 1) ?? [];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 transition hover:text-teal-700 dark:text-teal-400"
      >
        <TrendingUp size={15} /> نمودار تغییرات قیمت
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="نمودار تغییرات قیمت" size="lg">
        {isLoading && <p className="py-8 text-center text-sm text-zinc-400">در حال بارگذاری…</p>}
        {!isLoading && rows.length === 0 && (
          <p className="py-8 text-center text-sm text-zinc-400">تغییر قیمتی برای این کالا ثبت نشده است.</p>
        )}
        <div className="space-y-6">
          {rows.map((r) => (
            <div key={r.variantId}>
              <p className={cn('mb-2 text-xs font-bold text-zinc-500')}>تنوع {r.sku} — قیمت فعلی {faDigits(formatPrice(r.currentPrice))} تومان</p>
              <Spark points={r.points} />
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
}
