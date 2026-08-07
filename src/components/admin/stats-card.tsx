'use client';
/**
 * کارت آمار داشبورد + نمودارهای SVG سبک (میله‌ای / خطی / دونات)
 */
import type { LucideIcon } from 'lucide-react';
import { faDigits, formatPrice } from '@/lib/format';
import { cn } from '@/utils/cn';

export function StatsCard({
  icon: Icon,
  label,
  value,
  sub,
  tone = 'bg-brand-soft text-brand dark:bg-brand/15',
  isPrice = false,
}: {
  icon: LucideIcon;
  label: string;
  value: number | string;
  sub?: string;
  tone?: string;
  isPrice?: boolean;
}) {
  const display = typeof value === 'number' ? (isPrice ? formatPrice(value) : faDigits(value)) : value;
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
      <div className={cn('mb-3 flex size-10 items-center justify-center rounded-xl', tone)}>
        <Icon size={19} />
      </div>
      <p className="text-[11px] text-zinc-400">{label}</p>
      <p className="mt-1 text-lg font-black text-zinc-900 dark:text-white">
        {display}
        {isPrice && <span className="ms-1 text-[10px] font-normal text-zinc-400">تومان</span>}
      </p>
      {sub && <p className="mt-1 text-[10px] text-zinc-400">{sub}</p>}
    </div>
  );
}

// ════════ نمودار میله‌ای ════════
export function BarChart({
  data,
  height = 160,
  barTone = 'bg-brand',
  showValues = false,
  valueFormatter = (v: number) => faDigits(v),
}: {
  data: { label: string; value: number; hint?: string }[];
  height?: number;
  barTone?: string;
  showValues?: boolean;
  valueFormatter?: (v: number) => string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-1.5 sm:gap-2.5" style={{ height }} role="img" aria-label="نمودار">
      {data.map((d, i) => (
        <div key={i} className="group flex min-w-0 flex-1 flex-col items-center justify-end gap-1.5 self-stretch">
          {showValues && (
            <span className="text-[9px] font-bold text-zinc-400 opacity-0 transition group-hover:opacity-100">
              {valueFormatter(d.value)}
            </span>
          )}
          <div
            className={cn('w-full max-w-10 rounded-t-lg transition-all group-hover:opacity-80', barTone, d.value === 0 && 'bg-zinc-200 dark:bg-zinc-800')}
            style={{ height: `${Math.max(d.value === 0 ? 2 : 4, (d.value / max) * 100)}%` }}
            title={`${d.label}: ${valueFormatter(d.value)}${d.hint ? ` (${d.hint})` : ''}`}
          />
          <span className="max-w-full truncate text-[9px] text-zinc-400">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ════════ نمودار خطی ════════
export function LineChart({
  data,
  height = 180,
  stroke = '#ef4056',
  valueFormatter = (v: number) => faDigits(v),
}: {
  data: { label: string; value: number }[];
  height?: number;
  stroke?: string;
  valueFormatter?: (v: number) => string;
}) {
  if (data.length < 2) return <p className="py-8 text-center text-xs text-zinc-400">داده کافی موجود نیست</p>;
  const W = 700; const H = 220; const PAD = 30;
  const values = data.map((d) => d.value);
  const min = Math.min(0, ...values);
  const max = Math.max(1, ...values);
  const xs = (i: number) => PAD + (i * (W - PAD * 2)) / (data.length - 1);
  const ys = (v: number) => H - PAD - ((v - min) / (max - min)) * (H - PAD * 2);
  const path = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xs(i)},${ys(d.value)}`).join(' ');
  const area = `${path} L${xs(data.length - 1)},${H - PAD} L${xs(0)},${H - PAD} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }} role="img" aria-label="نمودار خطی">
      <defs>
        <linearGradient id="panelLineFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.22" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#panelLineFill)" />
      <path d={path} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={xs(i)} cy={ys(d.value)} r="4" fill="#fff" stroke={stroke} strokeWidth="2">
            <title>{d.label}: {valueFormatter(d.value)}</title>
          </circle>
          {(i % Math.ceil(data.length / 10) === 0 || i === data.length - 1) && (
            <text x={xs(i)} y={H - 8} textAnchor="middle" className="fill-zinc-400 text-[10px]">{d.label}</text>
          )}
        </g>
      ))}
    </svg>
  );
}

// ════════ دونات ────────
export function DonutChart({
  data,
  size = 160,
}: {
  data: { label: string; value: number; color: string }[];
  size?: number;
}) {
  const total = Math.max(1, data.reduce((s, d) => s + d.value, 0));
  const R = 60; const C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <div className="flex items-center gap-5">
      <svg width={size} height={size} viewBox="0 0 160 160" role="img" aria-label="نمودار دونات">
        <circle cx="80" cy="80" r={R} fill="none" className="stroke-zinc-100 dark:stroke-zinc-800" strokeWidth="18" />
        {data.map((d, i) => {
          const frac = d.value / total;
          const el = (
            <circle
              key={i}
              cx="80" cy="80" r={R} fill="none"
              stroke={d.color} strokeWidth="18"
              strokeDasharray={`${frac * C} ${C}`}
              strokeDashoffset={-offset * C}
              transform="rotate(-90 80 80)"
              strokeLinecap="butt"
            >
              <title>{d.label}: {faDigits(d.value)}</title>
            </circle>
          );
          offset += frac;
          return el;
        })}
        <text x="80" y="76" textAnchor="middle" className="fill-zinc-900 text-xl font-black dark:fill-white">{faDigits(total)}</text>
        <text x="80" y="96" textAnchor="middle" className="fill-zinc-400 text-[10px]">مجموع</text>
      </svg>
      <ul className="space-y-1.5">
        {data.map((d, i) => (
          <li key={i} className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300">
            <span className="size-2.5 rounded-full" style={{ backgroundColor: d.color }} />
            {d.label}
            <b className="text-zinc-900 dark:text-white">{faDigits(d.value)}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}
