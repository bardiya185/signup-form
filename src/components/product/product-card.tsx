'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Star, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '@/types';
import { toToman } from '@/utils/cn';
import { useCartStore } from '@/stores/cart.store';
import { useState } from 'react';
import { Spinner } from '@/components/ui/loading';

export function ProductCard({product}:{product:Product}) {
  const add=useCartStore(s=>s.add); const wish=useCartStore(s=>s.wishlist.includes(product.id)); const toggle=useCartStore(s=>s.toggleWishlist);
  const [adding,setAdding]=useState(false); const [added,setAdded]=useState(false);
  const discount=product.originalPrice?Math.round((1-product.price/product.originalPrice)*100):0;
  const handleAdd=()=>{if(adding)return;setAdding(true);add(product);setTimeout(()=>{setAdding(false);setAdded(true);setTimeout(()=>setAdded(false),1200)},350)};
  return <motion.article initial={{opacity:0,y:10}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.15}} whileHover={{y:-5}} className="group relative overflow-hidden rounded-2xl bg-white p-3 shadow-card transition dark:border dark:border-white/[.06] dark:bg-zinc-900"><button onClick={()=>toggle(product.id)} className="absolute left-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/85 text-zinc-500 shadow-sm transition hover:scale-110 dark:bg-zinc-800/90" aria-label="افزودن به علاقه‌مندی‌ها"><Heart size={17} fill={wish?'#ef4056':'none'} className={wish?'text-brand':''}/></button><Link href={`/products/${product.slug}`}><div className="relative aspect-square overflow-hidden rounded-xl bg-zinc-50 dark:bg-zinc-800"><Image src={product.image} alt={product.title} fill sizes="(max-width:640px) 50vw, 25vw" className="object-cover transition duration-500 group-hover:scale-105"/>{discount>0&&<span className="absolute bottom-2 right-2 rounded-md bg-brand px-1.5 py-0.5 text-xs font-bold text-white">٪{discount}</span>}</div><p className="mt-3 text-xs text-zinc-500">{product.brand}</p><h3 className="mt-1 line-clamp-2 min-h-10 text-sm font-semibold leading-5">{product.title}</h3></Link><div className="mt-3 flex items-center justify-between"><span className="flex items-center gap-1 text-xs"><Star size={14} fill="#fbbf24" className="text-amber-400"/>{product.rating.toLocaleString('fa-IR')}</span><button onClick={handleAdd} className={`grid h-9 w-9 place-items-center rounded-lg transition ${added?'bg-emerald-500 text-white':'bg-brand-soft text-brand hover:bg-brand hover:text-white'}`} aria-label="افزودن به سبد">{adding?<Spinner className="h-4 w-4"/>:added?<Check size={17}/>:<ShoppingCart size={17}/>}</button></div><div className="mt-2 text-left"><b className="price text-sm">{toToman(product.price)} <small className="text-[10px]">تومان</small></b>{product.originalPrice&&<del className="mr-2 text-xs text-zinc-400">{toToman(product.originalPrice)}</del>}</div></motion.article>;
}
