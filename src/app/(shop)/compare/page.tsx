'use client';
/**
 * صفحه مقایسه کالاها — جدول کنارهم با مشخصات و قیمت
 */
import Link from 'next/link';
import Image from 'next/image';
import { GitCompareArrows, ShoppingCart, X } from 'lucide-react';
import { useAddToCart, useCompare, useToggleCompare } from '@/hooks/api';
import { Button } from '@/components/ui/button';
import { EmptyState, PageLoading } from '@/components/ui/states';
import { StarRating } from '@/components/ui/rating';
import { faDigits, formatPrice } from '@/lib/format';
import { cn } from '@/utils/cn';

export default function ComparePage() {
  const compare = useCompare();
  const toggle = useToggleCompare();
  const addToCart = useAddToCart();

  if (compare.isLoading) return <PageLoading label="در حال بارگذاری لیست مقایسه…" />;

  const products = compare.data?.data.products ?? [];

  if (products.length === 0) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon="product"
          title="لیست مقایسه خالی است"
          description="روی دکمه مقایسه در صفحه هر کالا بزنید تا اینجا اضافه شود (تا ۴ کالا از یک دسته)."
          action={<Link href="/products"><Button size="sm">انتخاب کالا</Button></Link>}
        />
      </div>
    );
  }

  const cheapestVariantOf = (p: (typeof products)[number]) =>
    [...p.variants].sort((a, b) => a.effectivePrice - b.effectivePrice)[0];

  // کلیدهای یکتای مشخصات همه کالاها
  const attrKeys = [...new Set(products.flatMap((p) => p.attributes.map((a) => a.title)))];

  const rows: { label: string; render: (p: (typeof products)[number]) => React.ReactNode }[] = [
    {
      label: 'قیمت',
      render: (p) => {
        const v = cheapestVariantOf(p);
        return v ? (
          <div className="flex flex-col items-center gap-0.5">
            {v.discountPercent > 0 && (
              <span className="text-[10px] text-zinc-400 line-through">{formatPrice(v.price)}</span>
            )}
            <span className="text-base font-black text-zinc-900 dark:text-white">
              {formatPrice(v.effectivePrice)} <span className="text-[10px] font-normal text-zinc-400">تومان</span>
            </span>
          </div>
        ) : '—';
      },
    },
    { label: 'امتیاز کاربران', render: (p) => <StarRating value={p.rating} count={p.reviewCount} size={14} /> },
    { label: 'برند', render: (p) => p.brand?.title ?? '—' },
    { label: 'رنگ‌بندی', render: (p) => (
      <span className="flex justify-center gap-1">
        {p.colors.map((c) => <span key={c.id} title={c.name} className="size-4 rounded-full border border-black/10" style={{ backgroundColor: c.hex }} />)}
      </span>
    ) },
    { label: 'موجودی انبار', render: (p) => (
      p.stock > 0
        ? <span className="font-bold text-teal-600 dark:text-teal-400">موجود ({faDigits(p.stock)} عدد)</span>
        : <span className="font-bold text-red-500">ناموجود</span>
    ) },
    { label: 'گارانتی', render: (p) => cheapestVariantOf(p)?.guarantee?.title ?? '—' },
    { label: 'تعداد پرسش', render: (p) => faDigits(p.questionsCount) },
  ];

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 flex items-center gap-2 text-lg font-black text-zinc-900 dark:text-white">
        <GitCompareArrows size={20} className="text-brand" /> مقایسه کالاها
        {compare.data?.data.category && (
          <span className="text-xs font-normal text-zinc-400">در دسته «{compare.data.data.category.title}»</span>
        )}
      </h1>

      <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full min-w-[720px] border-collapse text-center text-xs">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-zinc-800">
              <th className="sticky right-0 w-32 bg-zinc-50 p-3 text-[11px] font-bold text-zinc-400 dark:bg-zinc-800/60">مشخصات</th>
              {products.map((p) => (
                <th key={p.id} className="min-w-52 border-s border-zinc-100 p-4 align-top dark:border-zinc-800">
                  <div className="relative">
                    <button
                      onClick={() => toggle.mutate({ productId: p.id, remove: true })}
                      className="absolute -top-1 left-0 rounded-full p-1.5 text-zinc-300 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                      aria-label="حذف از مقایسه"
                    >
                      <X size={15} />
                    </button>
                    <Link href={`/products/${p.slug}`} className="group block">
                      <div className="relative mx-auto size-24">
                        <Image src={p.image} alt={p.title} fill className="object-contain transition group-hover:scale-105" sizes="96px" />
                      </div>
                      <p className="mt-3 line-clamp-2 min-h-10 text-[11px] font-bold leading-5 text-zinc-800 group-hover:text-brand dark:text-zinc-100">
                        {p.title}
                      </p>
                    </Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={row.label} className={cn('border-b border-zinc-50 dark:border-zinc-800/60', ri % 2 === 0 && 'bg-zinc-50/50 dark:bg-zinc-800/20')}>
                <td className="sticky right-0 bg-zinc-50 p-3 text-start text-[11px] font-bold text-zinc-400 dark:bg-zinc-800/60">{row.label}</td>
                {products.map((p) => (
                  <td key={p.id} className="border-s border-zinc-50 p-3 align-middle text-zinc-600 dark:border-zinc-800/60 dark:text-zinc-300">
                    {row.render(p)}
                  </td>
                ))}
              </tr>
            ))}
            {/* مشخصات فنی */}
            {attrKeys.map((key, i) => (
              <tr key={key} className={cn('border-b border-zinc-50 dark:border-zinc-800/60', (rows.length + i) % 2 === 0 && 'bg-zinc-50/50 dark:bg-zinc-800/20')}>
                <td className="sticky right-0 bg-zinc-50 p-3 text-start text-[11px] font-bold text-zinc-400 dark:bg-zinc-800/60">{key}</td>
                {products.map((p) => (
                  <td key={p.id} className="border-s border-zinc-50 p-3 text-zinc-600 dark:border-zinc-800/60 dark:text-zinc-300">
                    {p.attributes.find((a) => a.title === key)?.value ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
            {/* افزودن به سبد */}
           <tr>
              <td className="sticky right-0 bg-zinc-50 p-3 dark:bg-zinc-800/60" />
              {products.map((p) => {
                const v = cheapestVariantOf(p);
                return (
                  <td key={p.id} className="border-s border-zinc-50 p-4 dark:border-zinc-800/60">
                    <Button
                      size="sm"
                      className="w-full"
                      disabled={!v || v.stock === 0}
                      loading={addToCart.isPending}
                      onClick={() => v && addToCart.mutate({ product_variant_id: v.id, quantity: 1 })}
                    >
                      <ShoppingCart size={14} /> افزودن به سبد
                    </Button>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
