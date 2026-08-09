'use client';
/**
 * فراموشی رمز عبور — دریافت کد بازیابی و تعیین رمز جدید
 */
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { AuthShell } from '@/components/auth/auth-shell';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { http, firstError, type Envelope } from '@/lib/http';
import { toast } from '@/stores/ui.store';
import { forgotSchema, resetSchema, type ForgotInput, type ResetInput } from '@/lib/validators';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [identity, setIdentity] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);

  const request = useMutation({
    mutationFn: (v: ForgotInput) =>
      http.post<Envelope<{ devCode?: string; message: string }>>('/auth/forgot-password', v),
    onSuccess: (res, v) => {
      toast.success(res.data.message);
      setIdentity(v.identity);
      setDevCode(res.data.devCode ?? null);
    },
    onError: (e) => toast.error(firstError(e)),
  });

  const reset = useMutation({
    mutationFn: (v: ResetInput & { identity: string }) =>
      http.post<Envelope<{ message: string }>>('/auth/reset-password', v),
    onSuccess: (res) => {
      toast.success(res.data.message);
      router.replace('/login');
    },
    onError: (e) => toast.error(firstError(e)),
  });

  const step1 = useForm<ForgotInput>({ resolver: zodResolver(forgotSchema) });
  const step2 = useForm<ResetInput>({ resolver: zodResolver(resetSchema) });

  return (
    <AuthShell
      title="بازیابی رمز عبور"
      subtitle={identity == null ? 'موبایل یا ایمیل حساب خود را وارد کنید تا کد بازیابی ارسال شود' : undefined}
    >
      {identity == null ? (
        <form onSubmit={step1.handleSubmit((v) => request.mutate(v))} className="space-y-4">
          <Field label="موبایل یا ایمیل" error={step1.formState.errors.identity?.message} required>
            <Input {...step1.register('identity')} placeholder="0912xxxxxxx" inputMode="tel" autoFocus />
          </Field>
          <Button type="submit" size="lg" className="w-full" loading={request.isPending}>
            <ShieldCheck size={17} /> ارسال کد بازیابی
          </Button>
          <Link href="/login" className="block text-center text-xs font-bold text-zinc-400 transition hover:text-brand">
            بازگشت به ورود
          </Link>
        </form>
      ) : (
        <form
          onSubmit={step2.handleSubmit((v) => reset.mutate({ ...v, identity }))}
          className="space-y-4"
        >
          <div className="rounded-xl bg-sky-50 p-3 text-center text-xs leading-6 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">
            کد بازیابی برای شما ارسال شد
            {devCode && (
              <span className="mt-1 block rounded-lg bg-white/70 py-1 font-mono text-base font-black tracking-[0.4em] text-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-100" dir="ltr">
                {devCode}
              </span>
            )}
          </div>
          <Field label="کد بازیابی" error={step2.formState.errors.code?.message} required>
            <Input {...step2.register('code')} inputMode="numeric" maxLength={5} dir="ltr" className="text-center text-lg tracking-[0.5em]" autoFocus />
          </Field>
          <Field label="رمز عبور جدید" error={step2.formState.errors.password?.message} required>
            <Input {...step2.register('password')} type="password" />
          </Field>
          <Field label="تکرار رمز عبور جدید" error={step2.formState.errors.password_confirmation?.message} required>
            <Input {...step2.register('password_confirmation')} type="password" />
          </Field>
          <Button type="submit" size="lg" className="w-full" loading={reset.isPending}>
            <KeyRound size={16} /> تغییر رمز عبور
          </Button>
          <button
            type="button"
            onClick={() => setIdentity(null)}
            className="mx-auto block text-xs font-bold text-zinc-400 transition hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            تغییر موبایل یا ایمیل
          </button>
        </form>
      )}
    </AuthShell>
  );
}
