'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, PackagePlus } from 'lucide-react';
import { PanelTitle, panelCard } from '@/components/admin/panel-shell';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { PageLoading } from '@/components/ui/states';
import { useSellerProductMutations } from '@/hooks/admin';
import { useCategories } from '@/hooks/api';
import { http, firstError, type Envelope } from '@/lib/http';
import type { BrandDto, CategoryNodeDto } from '@/types/dto';
import { faDigits } from '@/lib/format';

function flatten(nodes: CategoryNodeDto[], prefix = ''): { id: number; label: string }[] {
  const out: { id: number; label: string }[] = [];
  for (const n of nodes) {
    const label = prefix ? `${prefix} › ${n.title}` : n.title;
    out.push({ id: n.id, label });
    if (n.children?.length) out.push(...flatten(n.children, label));
  }
  return out;
}

const usePublicBrands = () =>
  useQuery({
    queryKey: ['brands', 'public'],
    queryFn: () => http.get<Envelope<BrandDto[]>>('/brands'),
    staleTime: 300_000,
  });

export default function SellerNewProductPage() {
  const router = useRouter();
  const cats = useCategories();
  const brands = usePublicBrands();
  const mut = useSellerProductMutations();
  const [form, setForm] = useState({
    title: '', category_id: '', brand_id: '', price: '', sale_price: '', stock: '',
    short_description: '', image: '',
  });
  const [error, setError] = useState('');

  const options = useMemo(() => flatten(cats.data?.data ?? []), [cats.data]);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  if (cats.isLoading) return <PageLoading />;

  const submit = () => {
    setError('');
    mut.create.mutate(
      {
        title: form.title.trim(),
        category_id: Number(form.category_id),
        brand_id: form.brand_id ? Number(form.brand_id) : undefined,
        price: Number(form.price) || 0,
        sale_price: form.sale_price ? Number(form.sale_price) : undefined,
        stock: Number(form.stock) || 0,
        short_description: form.short_description.trim() || undefined,
        image: form.image.trim() || undefined,
      },
      {
        onSuccess: () => router.push('/seller/products'),
        onError: (e: unknown) => setError(firstError(e) || 'خطا در ثبت کالا'),
      },
    );
  };

  return (
    <div className="space-y-6">
      <PanelTitle
        title="ثبت کالای جدید"
        description="کالا پس از بررسی و تأیید مدیریت در فروشگاه نمایش داده می‌شود"
        action={
          <Link href="/seller/products" className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 px-4 py-2 text-xs font-bold text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-300">
            <ArrowRight className="h-4 w-4" /> بازگشت به کالاها
          </Link>
        }
      />
      <div className={panelCard + ' mx-auto max-w-2xl space-y-5 p-6'}>
        <Field label="نام کالا" required hint="حداقل ۵ کاراکتر؛ نام کامل و واضح بنویسید">
          <Input value={form.title} onChange={set('title')} placeholder="مثال: گوشی موبایل سامسونگ گلکسی A55 ظرفیت 256 گیگابایت" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="دسته‌بندی" required>
            <select value={form.category_id} onChange={set('category_id')} className="h-11 w-full rounded-xl border border-zinc-200 bg-transparent px-3 text-sm outline-none focus:border-emerald-500 dark:border-zinc-700">
              <option value="">انتخاب کنید…</option>
              {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </Field>
          <Field label="برند">
            <select value={form.brand_id} onChange={set('brand_id')} className="h-11 w-full rounded-xl border border-zinc-200 bg-transparent px-3 text-sm outline-none focus:border-emerald-500 dark:border-zinc-700">
              <option value="">بدون برند</option>
              {(brands.data?.data ?? []).map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}
            </select>
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="قیمت اصلی (تومان)" required>
            <Input inputMode="numeric" dir="ltr" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value.replace(/\D/g, '') }))} placeholder="15000000" />
          </Field>
          <Field label="قیمت فروش (اختیاری)">
            <Input inputMode="numeric" dir="ltr" value={form.sale_price} onChange={(e) => setForm((f) => ({ ...f, sale_price: e.target.value.replace(/\D/g, '') }))} />
          </Field>
          <Field label="موجودی انبار" required>
            <Input inputMode="numeric" dir="ltr" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value.replace(/\D/g, '') }))} />
          </Field>
        </div>
        <Field label="توضیح کوتاه" hint="حداکثر ۵۰۰ کاراکتر">
          <textarea
            value={form.short_description}
            onChange={set('short_description')}
            rows={3}
            maxLength={500}
            className="w-full resize-none rounded-xl border border-zinc-200 bg-transparent p-3 text-sm leading-6 outline-none focus:border-emerald-500 dark:border-zinc-700"
            placeholder="ویژگی‌های اصلی کالا را کوتاه بنویسید…"
          />
        </Field>
        <Field label="نشانی تصویر" hint="لینک مستقیم تصویر کالا (اختیاری)">
          <Input dir="ltr" value={form.image} onChange={set('image')} placeholder="https://…" />
        </Field>

        {form.price && (
          <div className="rounded-xl bg-zinc-50 p-3 text-[11px] leading-5 text-zinc-500 dark:bg-zinc-800/60 dark:text-zinc-400">
            قیمت نمایشی: <b className="text-zinc-800 dark:text-zinc-100">{faDigits(Number(form.sale_price || form.price).toLocaleString('en-US'))} تومان</b>
            {form.sale_price && Number(form.sale_price) < Number(form.price) && (
              <span className="mr-2 rounded bg-rose-100 px-1.5 py-0.5 font-bold text-rose-600">
                {faDigits(Math.round((1 - Number(form.sale_price) / Number(form.price)) * 100))}٪ تخفیف
              </span>
            )}
          </div>
        )}

        {error && <p className="rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-600 dark:bg-rose-500/10">{error}</p>}
        <Button onClick={submit} loading={mut.create.isPending} className="w-full !bg-emerald-600 hover:!bg-emerald-700" disabled={!form.title.trim() || !form.category_id || !form.price}>
          <PackagePlus className="h-4 w-4" /> ثبت کالا و ارسال برای بررسی
        </Button>
      </div>
    </div>
  );
}
