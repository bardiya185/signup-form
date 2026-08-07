import type { Metadata } from 'next';
import Link from 'next/link';
import { Headset, Mail, MapPin, MessageSquareText, Phone } from 'lucide-react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'تماس با ما',
  description: 'راه‌های ارتباط با پشتیبانی گینان‌کالا — تلفن، ایمیل، تیکت پشتیبانی و آدرس دفتر.',
};

const CHANNELS = [
  {
    icon: Phone, title: 'تلفن پشتیبانی', value: '۰۲۱-۹۱۰۰۹۱۰۰',
    desc: 'شنبه تا پنجشنبه، ۸ صبح تا ۱۲ شب', ltr: '021-91009100', tone: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
  },
  {
    icon: Mail, title: 'ایمیل', value: 'support@ginankala.ir',
    desc: 'در کمتر از ۲۴ ساعت پاسخ می‌دهیم', ltr: 'support@ginankala.ir', tone: 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300',
  },
  {
    icon: MapPin, title: 'دفتر مرکزی', value: 'تهران، خیابان گینان، پلاک ۱۲',
    desc: 'پذیرش حضوری با هماهنگی قبلی', tone: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
  },
  {
    icon: Headset, title: 'پاسخگویی آنلاین', value: 'چت و تیکت پشتیبانی',
    desc: 'میانگین زمان پاسخ: ۲ ساعت کاری', tone: 'bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300',
  },
];

export default function ContactPage() {
  return (
    <div className="container-page max-w-4xl py-10">
      <Breadcrumb items={[{ title: 'خانه', href: '/' }, { title: 'تماس با ما' }]} />

      <div className="mt-6 text-center">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white">تماس با گینان‌کالا</h1>
        <p className="mt-2 text-sm text-zinc-400">هر ساعت از شبانه‌روز که باشد، ما کنار شماییم</p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {CHANNELS.map(({ icon: Icon, title, value, desc, ltr, tone }) => (
          <div key={title} className="flex items-start gap-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <span className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${tone}`}>
              <Icon size={22} />
            </span>
            <div>
              <h2 className="text-sm font-black text-zinc-800 dark:text-zinc-100">{title}</h2>
              <p className="mt-1 text-sm font-bold text-zinc-600 dark:text-zinc-300">
                {ltr ? <bdi dir="ltr" className="font-mono">{ltr}</bdi> : value}
              </p>
              <p className="mt-0.5 text-[11px] text-zinc-400">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-dashed border-brand/30 bg-brand-soft/40 p-6 text-center dark:bg-brand/10">
        <MessageSquareText size={26} className="mx-auto text-brand" />
        <h2 className="mt-2 text-sm font-black text-zinc-800 dark:text-zinc-100">سریع‌ترین راه: تیکت پشتیبانی</h2>
        <p className="mx-auto mt-1 max-w-md text-xs leading-6 text-zinc-500 dark:text-zinc-400">
          برای پیگیری سفارش، مرجوعی یا هر پرسش دیگر، از پنل کاربری خود تیکت ثبت کنید تا کارشناس مربوطه پاسخ دهد.
        </p>
        <Link href="/profile/tickets" className="mt-4 inline-block">
          <Button size="sm">ثبت تیکت پشتیبانی</Button>
        </Link>
      </div>
    </div>
  );
}
