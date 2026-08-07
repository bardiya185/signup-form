'use client';
import { cn } from '@/utils/cn';
import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

export const inputClass = (invalid?: boolean) =>
  cn(
    'h-11 w-full rounded-xl border bg-white px-4 text-sm text-zinc-800 placeholder:text-zinc-400 transition',
    'focus:outline-2 focus:outline-offset-0 disabled:opacity-50',
    invalid
      ? 'border-red-400 focus:outline-red-400'
      : 'border-zinc-300 focus:border-brand focus:outline-brand/30 dark:border-zinc-700 dark:focus:border-brand',
    'dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500',
  );

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(
  function Input({ className, invalid, ...props }, ref) {
    return <input ref={ref} className={cn(inputClass(invalid), className)} {...props} />;
  },
);

export function Field({
  label,
  error,
  hint,
  required,
  children,
  className,
}: {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
          {label} {required && <span className="text-brand">*</span>}
        </label>
      )}
      {children}
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
      {!error && hint && <p className="text-xs text-zinc-400">{hint}</p>}
    </div>
  );
}

export const PhoneInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(
  function PhoneInput({ className, invalid, ...props }, ref) {
    return (
      <Input
        ref={ref}
        dir="ltr"
        inputMode="numeric"
        maxLength={11}
        placeholder="0912 345 6789"
        className={cn('text-center tracking-[.2em]', className)}
        invalid={invalid}
        {...props}
      />
    );
  },
);
