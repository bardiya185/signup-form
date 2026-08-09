'use client';
/**
 * ورود — دوحالته: رمز عبور یا کد یکبارمصرف (OTP) با نمایش کد توسعه در حالت دمو
 */
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, LogIn, MessageCircleMore, RotateCcw } from 'lucide-react';
import { AuthShell } from '@/components/auth/auth-shell';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { useLogin, useSendOtp, useVerifyOtp } from '@/hooks/api';
import { loginSchema, otpSchema, phoneSchema, type LoginInput, type OtpInput } from '@/lib/validators';
import { faDigits } from '@/lib/format';
import { cn } from '@/utils/cn';
import { z } from 'zod';

type Mode = 'password' | 'otp';

function PasswordForm({ onDone }: { onDone: () => void }) {
  const login = useLogin();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identity: '', password: '' },
  });
  return (
    <form onSubmit={handleSubmit((v) => login.mutate(v, { onSuccess: onDone }))} className="space-y-4">
      <Field label="موبایل یا ایمیل" error={errors.identity?.message}>
        <Input {...register('identity')} inputMode="tel" placeholder="0912xxxxxxx" autoFocus />
      </Field>
      <Field label="رمز عبور" error={errors.password?.message}>
        <Input type="password" {...register('password')} placeholder="••••••" />
      </Field>
      <Button type="submit" size="lg" className="w-full" loading={login.isPending}>
        <LogIn size={17} /> ورود به گینان‌کالا
      </Button>
      <p className="rounded-xl bg-zinc-50 p-3 text-center text-[11px] leading-5 text-zinc-500 dark:bg-zinc-800/60 dark:text-zinc-400">
        دمو: <bdi dir="ltr" className="font-mono">09120000001</bdi> / رمز <bdi className="font-mono">123456</bdi>
      </p>
    </form>
  );
}

function OtpForm({ onDone }: { onDone: () => void }) {
  const sendOtp = useSendOtp();
  const verifyOtp = useVerifyOtp();
  const [phone, setPhone] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<OtpInput>({
    resolver: zodResolver(otpSchema),
  });

  const submitPhone = () => {
    const check = phoneSchema.safeParse(phone);
    if (!check.success) return setPhoneError(check.error.issues[0].message);
    setPhoneError(null);
    sendOtp.mutate(phone, { onSuccess: (res) => setDevCode(res.data.devCode) });
  };

  if (devCode == null) {
    return (
      <form onSubmit={(e) => { e.preventDefault(); submitPhone(); }} className="space-y-4">
        <Field label="شماره موبایل" error={phoneError ?? undefined}>
          <Input
            value={phone} onChange={(e) => setPhone(e.target.value)}
            inputMode="numeric" placeholder="0912xxxxxxx" autoFocus dir="ltr" className="text-center"
          />
        </Field>
        <Button type="submit" size="lg" className="w-full" loading={sendOtp.isPending}>
          <MessageCircleMore size={17} /> ارسال کد تایید
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit((v) => verifyOtp.mutate({ phone, code: v.code }, { onSuccess: onDone }))} className="space-y-4">
      <div className="rounded-xl bg-sky-50 p-3 text-center text-xs leading-6 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">
        کد تایید برای <bdi dir="ltr" className="font-mono">{phone}</bdi> پیامک شد
        <span className="mt-1 block rounded-lg bg-white/70 py-1 font-mono text-base font-black tracking-[0.4em] text-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-100" dir="ltr">
          {devCode}
        </span>
        <span className="text-[10px] opacity-70">(حالت توسعه — کد بالا نمایش داده می‌شود)</span>
      </div>
      <Field label="کد تایید" error={errors.code?.message}>
        <Input {...register('code')} inputMode="numeric" maxLength={5} placeholder="———" dir="ltr" className="text-center text-lg tracking-[0.5em]" autoFocus />
      </Field>
      <Button type="submit" size="lg" className="w-full" loading={verifyOtp.isPending}>تایید و ورود</Button>
      <button
        type="button"
        onClick={() => { setDevCode(null); }}
        className="mx-auto flex items-center gap-1 text-xs font-bold text-zinc-400 transition hover:text-zinc-600 dark:hover:text-zinc-200"
      >
        <RotateCcw size={12} /> تغییر شماره موبایل
      </button>
    </form>
  );
}

function LoginInner() {
  const [mode, setMode] = useState<Mode>('password');
  const router = useRouter();
  const sp = useSearchParams();
  const done = () => router.replace(sp.get('next') ?? '/profile');

  const tab = (key: Mode, label: string, Icon: typeof KeyRound) => (
    <button
      key={key}
      type="button"
      onClick={() => setMode(key)}
      className={cn(
        'flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-bold transition',
        mode === key ? 'bg-white text-brand shadow dark:bg-zinc-900' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200',
      )}
    >
      <Icon size={15} /> {label}
    </button>
  );

  return (
    <AuthShell
      title="ورود | ثبت‌نام"
      subtitle={<>با ورود به گینان‌کالا، <Link href="/page/terms" className="text-brand">قوانین و مقررات</Link> را می‌پذیرید</>}
    >
      <div className="mb-5 flex rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
        {tab('password', 'ورود با رمز عبور', KeyRound)}
        {tab('otp', 'ورود با کد یکبارمصرف', MessageCircleMore)}
      </div>

      {mode === 'password' ? <PasswordForm onDone={done} /> : <OtpForm onDone={done} />}

      <div className="mt-6 flex items-center justify-between border-t border-dashed border-zinc-200 pt-4 text-xs dark:border-zinc-700">
        <Link href="/forgot-password" className="font-bold text-zinc-400 transition hover:text-brand">
          رمز عبورم را فراموش کرده‌ام
        </Link>
        <Link href="/register" className="font-bold text-sky-600 hover:underline dark:text-sky-400">
          ثبت‌نام در گینان‌کالا
        </Link>
      </div>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}
