'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Menu, Search, ShoppingCart, User, Heart, Tag, ChevronDown, X } from 'lucide-react';
import { useCartStore } from '@/stores/cart.store';
import { ThemeToggle } from './theme-toggle';
import { useState } from 'react';
import { products } from '@/services/product.service';
import { cartService } from '@/services/cart.service';
import { toToman } from '@/utils/cn';

export function Header() {
  const [query, setQuery] = useState('');
  const items = useCartStore(s => s.items);
  const cartOpen = useCartStore(s => s.isCartOpen);
  const setCartOpen = useCartStore(s => s.setCartOpen);
  const result = query ? products.filter(p => p.title.includes(query) || p.brand.toLowerCase().includes(query.toLowerCase())).slice(0, 4) : [];
  const cart = cartService.calculate(items);
  return <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
    <div className="container-page">
      <div className="flex h-[72px] items-center gap-3">
        <button className="lg:hidden" aria-label="منو"><Menu/></button>
        <Link href="/" className="shrink-0 text-xl font-black text-brand">گینان<span className="text-zinc-800 dark:text-white">‌کالا</span></Link>
        <div className="relative hidden max-w-2xl flex-1 md:block">
          <Search className="absolute right-3 top-3 text-zinc-400" size={19}/>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="جستجو در گینان‌کالا..." className="h-11 w-full rounded-xl bg-zinc-100 pr-10 text-sm outline-none ring-brand focus:ring-2 dark:bg-zinc-900"/>
          {result.length>0 && <div className="absolute top-12 w-full overflow-hidden rounded-xl bg-white shadow-xl dark:bg-zinc-900">{result.map(p=><Link onClick={()=>setQuery('')} className="block px-4 py-3 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800" href={`/products/${p.slug}`} key={p.id}>{p.title}</Link>)}</div>}
        </div>
        <div className="mr-auto flex items-center gap-1">
          <ThemeToggle/>
          <Link href="/account" className="hidden items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold sm:flex"><User size={18}/>حساب کاربری</Link>
          <div className="relative">
            <button onClick={()=>setCartOpen(!cartOpen)} className="relative grid h-10 w-10 place-items-center rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800" aria-label="مشاهده سبد خرید"><ShoppingCart size={20}/>{items.length>0&&<b className="absolute -left-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[10px] text-white">{items.reduce((sum,item)=>sum+item.quantity,0)}</b>}</button>
            {cartOpen && <div className="absolute left-0 top-12 w-[335px] overflow-hidden rounded-2xl border bg-white text-right shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
              <div className="flex items-center justify-between border-b p-4"><b className="text-sm">سبد خرید شما</b><button onClick={()=>setCartOpen(false)} aria-label="بستن"><X size={18}/></button></div>
              {!items.length ? <div className="p-7 text-center"><ShoppingCart className="mx-auto text-zinc-300"/><p className="mt-2 text-sm text-zinc-500">سبد خرید شما خالی است.</p></div> : <><div className="max-h-72 divide-y overflow-auto">{items.slice(0,3).map(item=><div className="flex gap-3 p-3" key={item.product.id}><div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-zinc-100"><Image src={item.product.image} alt={item.product.title} fill sizes="56px" className="object-cover"/></div><div className="min-w-0 flex-1"><p className="line-clamp-1 text-xs font-bold">{item.product.title}</p><p className="mt-1 text-xs text-zinc-500">{item.quantity.toLocaleString('fa-IR')} عدد · {toToman(item.product.price * item.quantity)} تومان</p></div></div>)}</div>{items.length>3&&<p className="px-4 pt-3 text-xs text-zinc-500">و { (items.length-3).toLocaleString('fa-IR') } کالای دیگر</p>}<div className="border-t p-4"><div className="mb-3 flex justify-between text-sm"><span>مبلغ قابل پرداخت</span><b>{toToman(cart.total)} تومان</b></div><Link onClick={()=>setCartOpen(false)} href="/cart" className="block rounded-xl bg-brand py-3 text-center text-sm font-bold text-white">مشاهده و تکمیل خرید</Link></div></>}
            </div>}
          </div>
        </div>
      </div>
      <div className="flex h-11 items-center gap-6 overflow-x-auto whitespace-nowrap border-t text-sm font-semibold"><button className="flex items-center gap-1 text-brand"><Menu size={18}/>دسته‌بندی کالاها<ChevronDown size={14}/></button><Link href="/category/mobile">موبایل و تبلت</Link><Link href="/category/laptop">لپ‌تاپ و کامپیوتر</Link><Link href="/category/fashion">مد و پوشاک</Link><Link href="/category/home">خانه و آشپزخانه</Link><Link href="/category/gaming">گیمینگ</Link><a href="#offers" className="flex items-center gap-1"><Tag size={16} className="text-brand"/>تخفیف‌ها و پیشنهادها</a><a href="#best">پرفروش‌ترین‌ها</a><Link href="/account?tab=wishlist"><Heart size={16} className="ml-1 inline"/>علاقه‌مندی‌ها</Link><span className="mr-auto hidden items-center gap-1 text-xs text-zinc-500 lg:flex"><MapPin size={16} className="text-brand"/>ارسال به تهران، تهران</span></div>
    </div>
  </header>;
}
