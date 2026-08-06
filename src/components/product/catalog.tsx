'use client';

import { Product } from '@/types';
import { ProductCard } from './product-card';
import { ChevronDown, RotateCcw, SlidersHorizontal, Star, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toToman } from '@/utils/cn';
import { ProductGridSkeleton } from '@/components/ui/loading';

type Props = { products: Product[]; title: string; totalCount: number };
const sortOptions = [{id:'popular',label:'محبوب‌ترین'}, {id:'cheap',label:'ارزان‌ترین'}, {id:'expensive',label:'گران‌ترین'}, {id:'rating',label:'بیشترین امتیاز'}];

export function Catalog({products, title, totalCount}: Props) {
  const [sort, setSort] = useState('popular');
  const [available, setAvailable] = useState(false);
  const [discounted, setDiscounted] = useState(false);
  const [rating, setRating] = useState(0);
  const [brands, setBrands] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(Math.max(...products.map(p => p.price), 1));
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const min = Math.min(...products.map(p=>p.price), 0);
  const brandList = [...new Set(products.map(p=>p.brand))].sort();
  const toggleBrand = (brand:string) => setBrands(current => current.includes(brand) ? current.filter(x=>x!==brand) : [...current,brand]);
  const clear = () => { setAvailable(false);setDiscounted(false);setRating(0);setBrands([]);setMaxPrice(Math.max(...products.map(p=>p.price),1)); };
  const activeCount = Number(available)+Number(discounted)+Number(rating>0)+brands.length+(maxPrice<Math.max(...products.map(p=>p.price),1)?1:0);
  useEffect(() => { setIsFiltering(true); const timer=window.setTimeout(()=>setIsFiltering(false), 280); return ()=>window.clearTimeout(timer); }, [available, discounted, rating, brands, maxPrice, sort]);
  const filtered = useMemo(() => products.filter(p => (!available || p.stock>0) && (!discounted || !!p.originalPrice) && p.rating>=rating && (brands.length===0 || brands.includes(p.brand)) && p.price<=maxPrice).sort((a,b)=> sort==='cheap'?a.price-b.price : sort==='expensive'?b.price-a.price : sort==='rating'?b.rating-a.rating : (b.reviewCount-a.reviewCount)), [products,available,discounted,rating,brands,maxPrice,sort]);
  const Filters = () => <div className="space-y-1">
    <div className="flex items-center justify-between border-b pb-4"><h2 className="flex items-center gap-2 font-bold"><SlidersHorizontal size={18}/>فیلترها</h2>{activeCount>0&&<button onClick={clear} className="flex items-center gap-1 text-xs font-bold text-brand"><RotateCcw size={14}/>حذف همه</button>}</div>
    <FilterTitle label="وضعیت کالا"><Toggle checked={available} onChange={setAvailable} label="فقط کالاهای موجود"/><Toggle checked={discounted} onChange={setDiscounted} label="فقط کالاهای تخفیف‌دار"/></FilterTitle>
    <FilterTitle label="محدوده قیمت"><input aria-label="بیشترین قیمت" type="range" min={min} max={Math.max(...products.map(p=>p.price),1)} step="100000" value={maxPrice} onChange={e=>setMaxPrice(Number(e.target.value))} className="mt-3 w-full accent-brand"/><div className="mt-2 flex justify-between text-xs text-zinc-500"><span>از {toToman(min)}</span><b className="text-zinc-800 dark:text-white">تا {toToman(maxPrice)} تومان</b></div></FilterTitle>
    <FilterTitle label="امتیاز کاربران">{[4.5,4,3.5].map(value=><button key={value} onClick={()=>setRating(rating===value?0:value)} className={`mb-2 flex items-center gap-1 text-sm ${rating===value?'font-bold text-brand':'text-zinc-600 dark:text-zinc-300'}`}><span className={`grid h-4 w-4 place-items-center rounded border ${rating===value?'border-brand bg-brand text-white':''}`}>{rating===value&&'✓'}</span><Star size={14} fill="#fbbf24" className="text-amber-400"/>{value.toLocaleString('fa-IR')} و بالاتر</button>)}</FilterTitle>
    <FilterTitle label="برند">{brandList.map(brand=><label key={brand} className="mb-2 flex cursor-pointer items-center justify-between text-sm"><span>{brand}</span><input checked={brands.includes(brand)} onChange={()=>toggleBrand(brand)} type="checkbox" className="h-4 w-4 accent-brand"/></label>)}</FilterTitle>
  </div>;
  return <div className="container-page py-7"><nav className="text-xs text-zinc-500">خانه / دسته‌بندی‌ها / <span className="text-zinc-800 dark:text-zinc-200">{title}</span></nav><div className="mt-3 flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-black">{title}</h1><p className="muted mt-1">{totalCount.toLocaleString('fa-IR')} کالا در این دسته‌بندی</p></div><button onClick={()=>setFiltersOpen(true)} className="flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-bold shadow-sm lg:hidden"><SlidersHorizontal size={17}/>فیلترها {activeCount>0&&<b className="rounded bg-brand px-1.5 text-xs text-white">{activeCount}</b>}</button></div><div className="mt-6 grid gap-5 lg:grid-cols-[270px_minmax(0,1fr)]"><aside className="surface sticky top-32 hidden h-fit p-5 lg:block"><Filters/></aside><div><div className="surface mb-4 flex flex-wrap items-center gap-x-5 gap-y-3 p-4 text-sm"><b className="text-zinc-500">مرتب‌سازی:</b>{sortOptions.map(option=><button onClick={()=>setSort(option.id)} className={sort===option.id?'font-bold text-brand':'text-zinc-500'} key={option.id}>{option.label}</button>)}</div>{activeCount>0&&<div className="mb-4 flex flex-wrap gap-2">{available&&<Chip label="فقط موجود" onRemove={()=>setAvailable(false)}/>} {discounted&&<Chip label="تخفیف‌دار" onRemove={()=>setDiscounted(false)}/>} {rating>0&&<Chip label={`امتیاز ${rating}+`} onRemove={()=>setRating(0)}/>} {brands.map(b=><Chip key={b} label={b} onRemove={()=>toggleBrand(b)}/>)}</div>}<p className="mb-3 text-sm text-zinc-500">نمایش {filtered.length.toLocaleString('fa-IR')} کالا</p>{isFiltering ? <ProductGridSkeleton count={8}/> : filtered.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">{filtered.map(p=><ProductCard product={p} key={p.id}/>)}</div> : <div className="surface p-14 text-center"><h2 className="font-bold">کالایی با این فیلترها پیدا نشد</h2><button onClick={clear} className="mt-3 text-sm font-bold text-brand">پاک کردن فیلترها</button></div>}</div></div>{filtersOpen&&<div className="fixed inset-0 z-50 bg-zinc-950/45 lg:hidden" onClick={()=>setFiltersOpen(false)}><aside onClick={e=>e.stopPropagation()} className="absolute bottom-0 max-h-[85vh] w-full overflow-auto rounded-t-3xl bg-white p-5 dark:bg-zinc-900"><div className="mb-4 flex items-center justify-between"><b>فیلتر محصولات</b><button onClick={()=>setFiltersOpen(false)}><X/></button></div><Filters/><button onClick={()=>setFiltersOpen(false)} className="mt-5 w-full rounded-xl bg-brand py-3 text-sm font-bold text-white">مشاهده {filtered.length.toLocaleString('fa-IR')} کالا</button></aside></div>}</div>
}
function FilterTitle({label,children}:{label:string;children:React.ReactNode}){return <details open className="border-b py-4"><summary className="flex cursor-pointer list-none items-center justify-between text-sm font-bold">{label}<ChevronDown size={16}/></summary><div className="pt-3">{children}</div></details>}
function Toggle({checked,onChange,label}:{checked:boolean;onChange:(value:boolean)=>void;label:string}){return <label className="mb-3 flex cursor-pointer items-center justify-between text-sm text-zinc-600 dark:text-zinc-300"><span>{label}</span><button type="button" onClick={()=>onChange(!checked)} className={`relative h-5 w-9 rounded-full transition ${checked?'bg-brand':'bg-zinc-300 dark:bg-zinc-700'}`}><span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${checked?'right-4':'right-0.5'}`}/></button></label>}
function Chip({label,onRemove}:{label:string;onRemove:()=>void}){return <button onClick={onRemove} className="flex items-center gap-1 rounded-full bg-brand-soft px-3 py-1.5 text-xs font-bold text-brand"><X size={13}/>{label}</button>}
