'use client';
/**
 * ثبت‌نام فروشنده — فرم اطلاعات فروشگاه + نیازمند ورود
 */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BadgeCheck, Store, TrendingUp, Users } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useCities, useProvinces, useSellerRegister } from '@/hooks/account';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { Button } from '@/components/ui/button';
import { Field, Input, inputClass } from '@/components/ui/input';
import { sellerRegisterSchema, type SellerRegisterInput } from '@/lib/validators';
import { firstError } from '@/lib/http';
import { toast } from '@/stores/ui.store';

const PERKS = [
  { icon: Users, title: 'میلیون‌ها مشتری', desc: 'کالاهای شما در معرض دید خریداران سراسر کشور' },
  { icon: TrendingUp, title: 'رشد فروش', desc: 'ابزارهای تحلیل و گزارش فروش حرفه‌ای' },
  { icon: BadgeCheck, title: 'پرداخت منظم', desc: 'تسویه حساب شفاف و به‌موقع' },
];

export default function SellerRegisterPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);
  const registerSeller = useSellerRegister();
  const [done, setDone] = useState(false);

  const provinces = useProvinces();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<SellerRegisterInput>({
    resolver: zodResolver(sellerRegisterSchema),
    defaultValues: { shop_name: '', national_id: '', phone: '', email: '', province_id: 0, city_id: 0, address: '', shaba_number: '' },
  });
  const provinceId = watch('province_id');
  const cities = useCities(provinceId || undefined);

  useEffect(() => {
    if (initialized && !user) router.replace('/login?next=/seller-register');
  }, [initialized, user, router]);

  if (done) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <span className="flex size-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 dark:bg-emerald-500/15">
          <BadgeCheck size={42} />
        </span>
        <h1 className="mt-5 text-xl font-black text-zinc-900 dark:text-white">درخواست فروشندگی شما ثبت شد 🎉</h1>
        <p className="mt-2 max-w-md text-sm leading-7 text-zinc-500 dark:text-zinc-400">
          مدارک شما در حال بررسی است؛ نتیجه حداکثر تا ۴۸ ساعت آینده از طریق پیامک و اعلان به شما اطلاع‌رسانی می‌شود.
        </p>
        <Button className="mt-6" onClick={() => router.push('/profile')}>بازگشت به حساب کاربری</Button>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <Breadcrumb items={[{ title: 'خانه', href: '/' }, { title: 'فروشنده شوید' }]} />

      <div className="mt-6 grid items-start gap-8 lg:grid-cols-[1fr_380px]">
        {/* فرم */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
          <h1 className="flex items-center gap-2 text-xl font-black text-zinc-900 dark:text-white">
            <Store size={22} className="text-brand" /> فروشنده گینان‌کالا شوید
          </h1>
          <p className="mt-2 text-xs leading-6 text-zinc-400">
            فرم زیر را تکمیل کنید تا مدارک شما برای فعال‌سازی پنل فروشندگی بررسی شود.
          </p>

          <form
            onSubmit={handleSubmit((v) =>
              registerSeller.mutate(v as unknown as Record<string, unknown>, {
                onSuccess: () => setDone(true),
                onError: (e) => toast.error(firstError(e)),
              }),
            )}
            className="mt-6 grid gap-4 sm:grid-cols-2"
          >
            <Field label="نام فروشگاه" error={errors.shop_name?.message} required>
              <Input {...register('shop_name')} placeholder="مثلاً گالری گینان" invalid={!!errors.shop_name} />
            </Field>
            <Field label="کد ملی / شناسه ملی" error={errors.national_id?.message} required>
              <Input {...register('national_id')} inputMode="numeric" dir="ltr" invalid={!!errors.national_id} />
            </Field>
            <Field label="تلفن فروشگاه" error={errors.phone?.message} required>
              <Input {...register('phone')} inputMode="tel" dir="ltr" placeholder="021…" invalid={!!errors.phone} />
            </Field>
            <Field label="ایمیل کسب‌وکار" error={errors.email?.message} required>
              <Input {...register('email')} type="email" dir="ltr" invalid={!!errors.email} />
            </Field>
            <Field label="استان" error={errors.province_id?.message} required>
              <select
                className={inputClass(!!errors.province_id)}
                value={provinceId}
                onChange={(e) => { setValue('province_id', Number(e.target.value), { shouldValidate: true }); setValue('city_id', 0); }}
              >
                <option value={0}>انتخاب کنید</option>
                {provinces.data?.data.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </Field>
            <Field label="شهر" error={errors.city_id?.message} required>
              <select
                className={inputClass(!!errors.city_id)}
                disabled={!provinceId || cities.isLoading}
                value={watch('city_id')}
                onChange={(e) => setValue('city_id', Number(e.target.value), { shouldValidate: true })}
              >
                <option value={0}>{cities.isLoading ? 'در حال بارگذاری…' : 'انتخاب کنید'}</option>
                {cities.data?.data.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="آدرس فروشگاه" error={errors.address?.message} required className="sm:col-span-2">
              <textarea {...register('address')} rows={2} className={inputClass(!!errors.address)} />
            </Field>
            <Field label="شماره شبا (برای تسویه)" error={errors.shaba_number?.message} required className="sm:col-span-2" hint="بدون فاصله، شروع با IR">
              <Input {...register('shaba_number')} dir="ltr" placeholder="IR000000000000000000000000" invalid={!!errors.shaba_number} />
            </Field>

            <div className="sm:col-span-2">
              <Button type="submit" size="lg" className="w-full sm:w-auto" loading={registerSeller.isPending}>
                ثبت درخواست فروشندگی
              </Button>
              <p className="mt-3 text-[11px] leading-5 text-zinc-400">
                با ثبت درخواست، <Link href="/page/terms" className="text-brand">شرایط فروشندگی</Link> گینان‌کالا را می‌پذیرید.
              </p>
            </div>
          </form>
        </div>

        {/* مزایا */}
        <aside className="space-y-4">
          <div className="rounded-2xl bg-gradient-to-br from-brand to-rose-500 p-6 text-white">
            <h2 className="text-lg font-black">چرا گینان‌کالا؟</h2>
            <p className="mt-1 text-xs opacity-85">به خانواده فروشندگان گینان‌کالا بپیوندید</p>
          </div>
          {PERKS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand dark:bg-brand/15">
                <Icon size={19} />
              </span>
              <div>
                <h3 className="text-sm font-black text-zinc-800 dark:text-zinc-100">{title}</h3>
                <p className="mt-1 text-[11px] leading-5 text-zinc-400">{desc}</p>
              </div>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
