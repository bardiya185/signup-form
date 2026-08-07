'use client';
/**
 * ویرایش حساب کاربری — اطلاعات شخصی + تغییر رمز عبور
 */
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, Save, UserRoundPen } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useChangePassword, useUpdateProfile } from '@/hooks/account';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { profileSchema, changePasswordSchema, type ProfileInput, type ChangePasswordInput } from '@/lib/validators';
import { jdate } from '@/lib/format';

const cardCls = 'rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900';

function ProfileForm() {
  const user = useAuthStore((s) => s.user);
  const update = useUpdateProfile();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { first_name: '', last_name: '', email: '', national_code: '', birth_date: '', gender: undefined },
  });

  useEffect(() => {
    if (user) {
      reset({
        first_name: user.firstName ?? '',
        last_name: user.lastName ?? '',
        email: user.email ?? '',
        national_code: user.nationalCode ?? '',
        birth_date: user.birthDate ?? '',
        gender: user.gender ?? undefined,
      });
    }
  }, [user, reset]);

  return (
    <section className={cardCls}>
      <h2 className="mb-5 flex items-center gap-2 text-sm font-black text-zinc-800 dark:text-zinc-100">
        <UserRoundPen size={17} className="text-brand" /> اطلاعات شخصی
      </h2>
      <form
        onSubmit={handleSubmit((v) => update.mutate({ ...v, email: v.email || undefined, national_code: v.national_code || undefined }))}
        className="grid gap-4 sm:grid-cols-2"
      >
        <Field label="نام" error={errors.first_name?.message} required>
          <Input {...register('first_name')} invalid={!!errors.first_name} />
        </Field>
        <Field label="نام خانوادگی" error={errors.last_name?.message} required>
          <Input {...register('last_name')} invalid={!!errors.last_name} />
        </Field>
        <Field label="ایمیل" error={errors.email?.message}>
          <Input {...register('email')} type="email" dir="ltr" invalid={!!errors.email} />
        </Field>
        <Field label="کد ملی" error={errors.national_code?.message}>
          <Input {...register('national_code')} inputMode="numeric" maxLength={10} dir="ltr" invalid={!!errors.national_code} />
        </Field>
        <Field label="تاریخ تولد" error={errors.birth_date?.message} hint="مثال: 1370/05/12">
          <Input {...register('birth_date')} dir="ltr" placeholder="1370/05/12" />
        </Field>
        <Field label="جنسیت">
          <div className="flex gap-2">
            {([['male', 'آقا'], ['female', 'خانم']] as const).map(([v, l]) => (
              <label key={v} className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-zinc-200 py-2.5 text-sm font-bold text-zinc-600 has-checked:border-brand has-checked:bg-brand-soft has-checked:text-brand dark:border-zinc-700 dark:text-zinc-300 dark:has-checked:bg-brand/10">
                <input type="radio" value={v} {...register('gender')} className="hidden" />
                {l}
              </label>
            ))}
          </div>
        </Field>
        <div className="sm:col-span-2">
          <Button type="submit" loading={update.isPending}><Save size={15} /> ذخیره تغییرات</Button>
        </div>
      </form>
    </section>
  );
}

function PasswordForm() {
  const change = useChangePassword();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { current_password: '', password: '', password_confirmation: '' },
  });

  return (
    <section className={cardCls}>
      <h2 className="mb-5 flex items-center gap-2 text-sm font-black text-zinc-800 dark:text-zinc-100">
        <KeyRound size={17} className="text-brand" /> تغییر رمز عبور
      </h2>
      <form
        onSubmit={handleSubmit((v) => change.mutate(v, { onSuccess: () => reset() }))}
        className="grid gap-4 sm:grid-cols-2"
      >
        <Field label="رمز عبور فعلی" error={errors.current_password?.message} required className="sm:col-span-2">
          <Input {...register('current_password')} type="password" invalid={!!errors.current_password} />
        </Field>
        <Field label="رمز عبور جدید" error={errors.password?.message} required>
          <Input {...register('password')} type="password" invalid={!!errors.password} />
        </Field>
        <Field label="تکرار رمز عبور جدید" error={errors.password_confirmation?.message} required>
          <Input {...register('password_confirmation')} type="password" invalid={!!errors.password_confirmation} />
        </Field>
        <div className="sm:col-span-2">
          <Button type="submit" variant="dark" loading={change.isPending}><Save size={15} /> تغییر رمز</Button>
        </div>
      </form>
    </section>
  );
}

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  return (
    <div className="space-y-6">
      <h1 className="text-lg font-black text-zinc-900 dark:text-white">ویرایش حساب کاربری</h1>
      {user && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 rounded-2xl bg-zinc-50 px-5 py-4 text-xs text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400">
          <span>موبایل: <bdi dir="ltr" className="font-mono">{user.phone}</bdi> {user.phoneVerifiedAt ? '✅' : '(تایید نشده)'}</span>
          <span>ایمیل: <bdi dir="ltr" className="font-mono">{user.email ?? '—'}</bdi> {user.emailVerifiedAt ? '✅' : ''}</span>
          <span>عضویت: {jdate(user.createdAt)}</span>
        </div>
      )}
      <ProfileForm />
      <PasswordForm />
    </div>
  );
}
