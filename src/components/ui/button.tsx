import { cn } from '@/utils/cn';
import { Loader2 } from 'lucide-react';
import { forwardRef, type ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'dark';
type Size = 'sm' | 'md' | 'lg' | 'icon';

const variants: Record<Variant, string> = {
  primary:
    'bg-brand text-white hover:bg-brand-dark active:scale-[.98] disabled:bg-brand/50 shadow-sm hover:shadow-md',
  secondary:
    'bg-brand-soft text-brand hover:bg-brand/15 active:scale-[.98] dark:bg-brand/20 dark:text-red-300 dark:hover:bg-brand/30',
  outline:
    'border border-zinc-300 bg-white text-zinc-700 hover:border-brand hover:text-brand active:scale-[.98] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-brand',
  ghost:
    'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 active:scale-[.98] dark:text-zinc-300 dark:hover:bg-zinc-800',
  danger:
    'bg-red-600 text-white hover:bg-red-700 active:scale-[.98] disabled:bg-red-400',
  dark:
    'bg-zinc-900 text-white hover:bg-zinc-800 active:scale-[.98] dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-xs rounded-xl gap-1.5',
  md: 'h-11 px-5 text-sm rounded-xl gap-2',
  lg: 'h-12 px-7 text-base rounded-xl gap-2',
  icon: 'h-10 w-10 rounded-xl',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', loading, disabled, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex select-none items-center justify-center font-bold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
});
