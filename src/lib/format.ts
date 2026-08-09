/**
 * ─── قالب‌بندی فارسی: اعداد، قیمت، تاریخ جلالی (بدون وابستگی خارجی) ───
 */
const nf = new Intl.NumberFormat('fa-IR');
const nfEn = new Intl.NumberFormat('en-US');

export const faDigits = (n: number | string): string => nf.format(Number(n));

export const toToman = (n: number): string => `${nf.format(n)} تومان`;

export const formatPrice = (n: number): string => nf.format(n);

export const faPercent = (n: number): string => `٪${nf.format(n)}`;

export const enThousands = (n: number): string => nfEn.format(n);

const JALALI_LONG = new Intl.DateTimeFormat('fa-IR', { dateStyle: 'long' });
const JALALI_MED = new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium' });
const JALALI_TIME = new Intl.DateTimeFormat('fa-IR', { timeStyle: 'short' });

export const jdate = (iso?: string | null, style: 'long' | 'medium' = 'long'): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  return (style === 'long' ? JALALI_LONG : JALALI_MED).format(d);
};

export const jdatetime = (iso?: string | null): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${JALALI_MED.format(d)}، ${JALALI_TIME.format(d)}`;
};

/** زمان باقی‌مانده — برای تایمر شگفت‌انگیز */
export interface TimeLeft { days: number; hours: number; minutes: number; seconds: number; expired: boolean }
export function timeLeft(targetIso: string, nowMs = Date.now()): TimeLeft {
  const diff = new Date(targetIso).getTime() - nowMs;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  const s = Math.floor(diff / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    expired: false,
  };
}

/** «۳ روز پیش»-style */
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'همین حالا';
  if (mins < 60) return `${faDigits(mins)} دقیقه پیش`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${faDigits(hours)} ساعت پیش`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${faDigits(days)} روز پیش`;
  return jdate(iso, 'medium');
}
