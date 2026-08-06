'use client';

import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { MapPin, Menu, Search, ShoppingCart, User, Heart, Tag, ChevronDown, X, Trash2 } from 'lucide-react';
import { useCartStore } from '@/stores/cart.store';
import { ThemeToggle } from './theme-toggle';
import { useEffect, useState } from 'react';
import { products } from '@/services/product.service';
import { cartService } from '@/services/cart.service';
import { toToman } from '@/utils/cn';
import { CartSkeleton, Spinner } from '@/components/ui/loading';

export function Header() {
  const [query, setQuery] = useState('');
  const [seedingCart, setSeedingCart] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const items = useCartStore(s => s.items);
  const cartOpen = useCartStore(s => s.isCartOpen);
  const hydrated = useCartStore(s => s.hasHydrated);
  const setCartOpen = useCartStore(s => s.setCartOpen);
  const remove = useCartStore(s => s.remove);
  const add = useCartStore(s => s.add);
  useEffect(() => { if (!query) return setIsSearching(false); setIsSearching(true); const timer=window.setTimeout(()=>setIsSearching(false),220); return ()=>window.clearTimeout(timer); }, [query]);
  const result = query ? products.filter(p => p.title.includes(query) || p.brand.toLowerCase().includes(query.toLowerCase())).slice(0, 4) : [];
  const cart = cartService.calculate(items);
  const totalItems=items.reduce((sum,item)=>sum+item.quantity,0);
  return <>
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/95 backdrop-blur dark:border-white/[.08] dark:bg-zinc-950/90">
      <div className="container-page">
        <div className="flex h-[72px] items-center gap-3">
          <button className="lg:hidden" aria-label="منو"><Menu/></button>
          <Link href="/" className="shrink-0 text-xl font-black text-brand">گینان<span className="text-zinc-800 dark:text-white">‌کالا</span></Link>
          <div className="relative hidden max-w-2xl flex-1 md:block"><Search className="absolute right-3 top-3 text-zinc-400" size={19}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="جستجو در گینان‌کالا..." className="h-11 w-full rounded-xl bg-zinc-100 pr-10 text-sm outline-none ring-brand transition focus:ring-2 dark:bg-zinc-900"/>{query && <div className="absolute top-12 w-full overflow-hidden rounded-xl bg-white shadow-xl dark:bg-zinc-900">{isSearching ? <div className="flex items-center gap-2 p-4 text-sm text-zinc-500"><Spinner/>در حال جستجو...</div> : result.length ? result.map(p=><Link onClick={()=>setQuery('')} className="block px-4 py-3 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800" href={`/products/${p.slug}`} key={p.id}>{p.title}</Link>) : <p className="p-4 text-sm text-zinc-500">محصولی پیدا نشد.</p>}</div>}</div>
          <div className="mr-auto flex items-center gap-1"><ThemeToggle/><Link href="/account" className="hidden items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-sm font-bold dark:border-zinc-700 sm:flex"><User size={18}/>حساب کاربری</Link><button onClick={()=>setCartOpen(true)} className={`relative grid h-10 w-10 place-items-center rounded-xl transition hover:bg-zinc-100 dark:hover:bg-zinc-800 ${totalItems?'animate-soft-pulse':''}`} aria-label="مشاهده سبد خرید"><ShoppingCart size={20}/>{totalItems>0&&<b className="absolute -left-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[10px] text-white">{totalItems.toLocaleString('fa-IR')}</b>}</button></div>
        </div>
        <div className="flex h-11 items-center gap-6 overflow-x-auto whitespace-nowrap border-t border-zinc-200/80 text-sm font-semibold dark:border-white/[.08]"><button className="flex items-center gap-1 text-brand"><Menu size={18}/>دسته‌بندی کالاها<ChevronDown size={14}/></button><Link href="/category/mobile">موبایل و تبلت</Link><Link href="/category/laptop">لپ‌تاپ و کامپیوتر</Link><Link href="/category/fashion">مد و پوشاک</Link><Link href="/category/home">خانه و آشپزخانه</Link><Link href="/category/gaming">گیمینگ</Link><a href="#offers" className="flex items-center gap-1"><Tag size={16} className="text-brand"/>تخفیف‌ها و پیشنهادها</a><a href="#best">پرفروش‌ترین‌ها</a><Link href="/account?tab=wishlist"><Heart size={16} className="ml-1 inline"/>علاقه‌مندی‌ها</Link><span className="mr-auto hidden items-center gap-1 text-xs text-zinc-500 lg:flex"><MapPin size={16} className="text-brand"/>ارسال به تهران، تهران</span></div>
      </div>
    </header>
    <AnimatePresence>{cartOpen && <><motion.button aria-label="بستن سبد خرید" className="fixed inset-0 z-50 bg-zinc-950/55 backdrop-blur-sm" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setCartOpen(false)}/><motion.aside className="fixed inset-y-0 right-0 z-[60] flex w-full max-w-md flex-col bg-white shadow-2xl dark:bg-[#11131a]" initial={{x:'100%'}} animate={{x:0}} exit={{x:'100%'}} transition={{type:'spring',damping:28,stiffness:280}} aria-label="سبد خرید">
      <div className="flex items-center justify-between border-b border-zinc-200 p-5 dark:border-white/[.08]"><div><h2 className="font-bold">سبد خرید شما</h2><p className="mt-1 text-xs text-zinc-500">{hydrated ? `${totalItems.toLocaleString('fa-IR')} کالا در سبد` : 'در حال دریافت سبد'}</p></div><button onClick={()=>setCartOpen(false)} className="grid h-9 w-9 place-items-center rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800" aria-label="بستن"><X size={20}/></button></div>
      {!hydrated ? <CartSkeleton/> : !items.length ? <div className="m-auto text-center"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-soft text-brand"><ShoppingCart/></div><h3 className="mt-4 font-bold">سبد خرید شما خالی است</h3><p className="mt-2 text-sm text-zinc-500">محصولات دلخواهتان را به سبد اضافه کنید.</p><button disabled={seedingCart} onClick={()=>{setSeedingCart(true);setTimeout(()=>{add(products[0]);add(products[1]);setSeedingCart(false)},450)}} className="mt-5 inline-flex min-w-52 items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white disabled:opacity-70">{seedingCart?<><Spinner/>در حال افزودن...</>:<>افزودن پیشنهادهای منتخب</>}</button><button onClick={()=>setCartOpen(false)} className="mt-3 block w-full text-sm font-bold text-brand">ادامه خرید</button></div> : <><div className="flex-1 divide-y divide-zinc-100 overflow-y-auto dark:divide-white/[.06]">{items.map(item=><motion.div layout initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:30}} className="flex gap-3 p-4" key={`${item.product.id}-${item.color}-${item.storage}`}><div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800"><Image src={item.product.image} alt={item.product.title} fill sizes="80px" className="object-cover"/></div><div className="min-w-0 flex-1"><p className="line-clamp-2 text-sm font-bold leading-6">{item.product.title}</p><p className="mt-1 text-xs text-zinc-500">{item.color} {item.storage&&`• ${item.storage}`}</p><div className="mt-2 flex items-center justify-between"><b className="text-sm">{toToman(item.product.price*item.quantity)} تومان</b><button onClick={()=>remove(item.product.id)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-brand-soft hover:text-brand" aria-label="حذف محصول"><Trash2 size={17}/></button></div></div></motion.div>)}</div><div className="border-t border-zinc-200 p-5 dark:border-white/[.08]"><div className="mb-1 flex justify-between text-sm text-zinc-500"><span>قیمت کالاها</span><span>{toToman(cart.subtotal)} تومان</span></div><div className="mb-4 flex justify-between text-sm font-bold"><span>مبلغ قابل پرداخت</span><span>{toToman(cart.total)} تومان</span></div><Link onClick={()=>setCartOpen(false)} href="/cart" className="block rounded-xl bg-brand py-3.5 text-center text-sm font-bold text-white transition hover:bg-brand-dark">مشاهده و تکمیل خرید</Link></div></>}</motion.aside></>}</AnimatePresence>
  </>;
}
