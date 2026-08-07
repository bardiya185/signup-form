'use client';
/**
 * ثبت‌نام حساب کاربری جدید — React Hook Form + Zod
 */
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus } from 'lucide-react';
import { AuthShell } from '@/components/auth/auth-shell';
import { Button } from '@/components/ui/button';
import { Field, Input, PhoneInput } from '@/components/ui/input';
import { useRegister } from '@/hooks/api';
import { registerSchema, type RegisterInput } from '@/lib/validators';

export default function RegisterPage() {
  const router = useRouter();
  const registerMutation = useRegister();
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { first_name: '', last_name: '', phone: '', email: '', password: '', password_confirmation: '' },
  });

  return (
    <AuthShell
      title="ثبت‌نام در گینان‌کالا"
      subtitle="حساب کاربری بسازید و از تخفیف‌های ویژه بهره‌مند شوید"
    >
      <form
        onSubmit={handleSubmit((v) =>
          registerMutation.mutate({ ...v, email: v.email || undefined }, { onSuccess: () => router.replace('/profile') }),
        )}
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label="نام" error={errors.first_name?.message} required>
            <Input {...register('first_name')} placeholder="مثلاً سارا" autoFocus invalid={!!errors.first_name} />
          </Field>
          <Field label="نام خانوادگی" error={errors.last_name?.message} required>
            <Input {...register('last_name')} placeholder="محمدی" invalid={!!errors.last_name} />
          </Field>
        </div>
        <Field label="شماره موبایل" error={errors.phone?.message} required>
          <PhoneInput {...register('phone')} invalid={!!errors.phone} />
        </Field>
        <Field label="ایمیل (اختیاری)" error={errors.email?.message}>
          <Input {...register('email')} type="email" dir="ltr" placeholder="you@example.com" invalid={!!errors.email} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="رمز عبور" error={errors.password?.message} required>
            <Input {...register('password')} type="password" placeholder="حداقل ۶ کاراکتر" invalid={!!errors.password} />
          </Field>
          <Field label="تکرار رمز عبور" error={errors.password_confirmation?.message} required>
            <Input {...register('password_confirmation')} type="password" invalid={!!errors.password_confirmation} />
          </Field>
        </div>

        <Button type="submit" size="lg" className="w-full" loading={registerMutation.isPending}>
          <UserPlus size={17} /> ساخت حساب کاربری
        </Button>

        <p className="text-center text-xs text-zinc-400">
          قبلاً ثبت‌نام کرده‌اید؟{' '}
          <Link href="/login" className="font-bold text-sky-600 hover:underline dark:text-sky-400">وارد شوید</Link>
        </p>
      </form>
    </AuthShell>
  );
}
