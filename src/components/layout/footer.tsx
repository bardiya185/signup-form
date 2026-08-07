import { menusByLocation } from '@/server/repositories/content.repository';
import { faDigits } from '@/lib/format';
import {
  Clock, CreditCard, Headset, Mail, MapPin, Phone, RotateCcw, ShieldCheck, Truck,
} from 'lucide-react';
import Link from 'next/link';

const features = [
  { icon: Truck, title: 'ارسال سریع', desc: 'به سراسر کشور' },
  { icon: ShieldCheck, title: 'ضمانت اصالت', desc: 'کالای اورجینال' },
  { icon: RotateCcw, title: '۷ روز بازگشت', desc: 'بدون قید و شرط' },
  { icon: CreditCard, title: 'پرداخت امن', desc: 'درگاه رسمی بانکی' },
  { icon: Headset, title: 'پشتیبانی ۲۴/۷', desc: 'پاسخگوی همیشگی' },
];

const symbols = ['نماد اعتماد الکترونیکی', 'درگاه پرداخت امن', 'رسانه‌های دیجیتال'];

export function Footer() {
  const cols = ['footer_col1', 'footer_col2', 'footer_col3'].map(
    (loc) => menusByLocation(loc)[0],
  );

  return (
    <footer className="mt-16 border-t border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      {/* مزیت‌ها */}
      <div className="container-page grid grid-cols-2 gap-4 border-b border-zinc-100 py-8 dark:border-zinc-800 sm:grid-cols-3 lg:grid-cols-5">
        {features.map((f) => (
          <div key={f.title} className="flex items-center gap-3">
            <span className="rounded-2xl bg-brand-soft p-3 text-brand dark:bg-brand/15 dark:text-red-300">
              <f.icon size={22} />
            </span>
            <div>
              <p className="text-sm font-black text-zinc-800 dark:text-zinc-100">{f.title}</p>
              <p className="text-xs text-zinc-400">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* لینک‌ها */}
      <div className="container-page grid gap-10 py-10 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand text-lg font-black text-white">گ</span>
            <span className="text-lg font-black text-zinc-900 dark:text-white">گینان<span className="text-brand">‌کالا</span></span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-7 text-zinc-500 dark:text-zinc-400">
            فروشگاه اینترنتی گینان‌کالا؛ مرجع خرید آنلاین کالای دیجیتال، مد و پوشاک، خانه و آشپزخانه، کتاب و زیبایی با بهترین قیمت و ضمانت اصالت کالا.
          </p>
          <div className="mt-5 space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
            <p className="flex items-center gap-2"><Phone size={15} className="text-brand" /> پشتیبانی: <span dir="ltr" className="font-bold tabular-nums">{faDigits(2191001100)}</span></p>
            <p className="flex items-center gap-2"><Mail size={15} className="text-brand" /> support@ginankala.ir</p>
            <p className="flex items-center gap-2"><MapPin size={15} className="text-brand" /> تهران، خیابان ولیعصر، برج گینان</p>
            <p className="flex items-center gap-2"><Clock size={15} className="text-brand" /> ۲۴ ساعته، ۷ روز هفته</p>
          </div>
        </div>
        {cols.map((col) => (
          <div key={col?.id ?? Math.random()}>
            <h4 className="mb-4 text-sm font-black text-zinc-900 dark:text-white">{col?.title}</h4>
            <ul className="space-y-2.5">
              {col?.items.map((item) => (
                <li key={item.link + item.label}>
                  <Link href={item.link} className="text-[13px] text-zinc-500 transition hover:text-brand dark:text-zinc-400">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* نمادها و کپی‌رایت */}
      <div className="border-t border-zinc-100 py-6 dark:border-zinc-800">
        <div className="container-page flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-zinc-400">
            © {faDigits(1405)} گینان‌کالا — تمام حقوق محفوظ است. (پروژه‌ی نمایشی)
          </p>
          <div className="flex gap-3">
            {symbols.map((s) => (
              <span key={s} className="flex h-16 w-14 items-center justify-center rounded-xl border border-zinc-200 p-1 text-center text-[8px] leading-3 text-zinc-400 dark:border-zinc-700">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
