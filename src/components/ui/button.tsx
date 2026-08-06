import { cn } from '@/utils/cn';
import { ButtonHTMLAttributes } from 'react';
import { Spinner } from './loading';
type Props=ButtonHTMLAttributes<HTMLButtonElement>&{isLoading?:boolean};
export function Button({className,isLoading=false,children,disabled,...props}:Props){return <button className={cn('inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-bold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50',className)} disabled={disabled||isLoading} {...props}>{isLoading?<Spinner/>:children}</button>}
