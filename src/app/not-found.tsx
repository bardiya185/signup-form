import Link from 'next/link';
import { Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-8xl font-black tracking-tight text-brand">۴۰۴</p>
      <span className="mt-4 flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand dark:bg-brand/15">
        <Compass size={26} />
      </span>
      <h1 className="mt-4 text-xl font-black text-zinc-900 dark:text-white">صفحه‌ای که دنبالش بودید پیدا نشد!</h1>
      <p className="mt-2 max-w-md text-sm leading-7 text-zinc-500 dark:text-zinc-400">
        شاید آدرس را اشتباه وارد کرده‌اید یا صفحه جابه‌جا شده است. از جستجو یا دسته‌بندی‌ها به کالای موردنظرتان برسید.
      </p>
      <div className="mt-7 flex gap-3">
        <Link href="/"><Button>صفحه اصلی</Button></Link>
        <Link href="/products"><Button variant="outline">مشاهده محصولات</Button></Link>
      </div>
    </div>
  );
}
