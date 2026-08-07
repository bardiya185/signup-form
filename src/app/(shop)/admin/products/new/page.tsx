'use client';
/**
 * ایجاد محصول جدید (ادمین) — فرم RHF + Zod
 */
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PackagePlus } from 'lucide-react';
import { useAdminBrands, useAdminCategories, useAdminProductMutations } from '@/hooks/admin';
import { PanelTitle, panelCard } from '@/components/admin/panel-shell';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';

const schema = z.object({
  title: z.string().min(5, 'عنوان حداقل ۵ حرف است'),
  category_id: z.number().min(1, 'دسته‌بندی را انتخاب کنید'),
  brand_id: z.number().optional(),
  price: z.number().min(1000, 'قیمت حداقل ۱,۰۰۰ تومان است'),
  sale_price: z.number().optional(),
  stock: z.number().min(0, 'موجودی منفی مجاز نیست'),
  short_description: z.string().max(500, 'حداکثر ۵۰۰ کاراکتر').optional(),
});
type FormValues = z.infer<typeof schema>;

export default function AdminNewProductPage() {
  const router = useRouter();
  const categories = useAdminCategories();
  const brands = useAdminBrands();
  const mutations = useAdminProductMutations();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', category_id: 0, price: 100000, sale_price: undefined, stock: 10, short_description: '' },
  });

  return (
    <div>
      <PanelTitle title="ایجاد محصول جدید" description="پس از ایجاد، تنوع و جزئیات بیشتر قابل ویرایش است" />

      <form
        onSubmit={handleSubmit((v) =>
          mutations.create.mutate(
            { ...v, brand_id: v.brand_id || undefined, sale_price: v.sale_price || undefined },
            { onSuccess: () => router.push('/admin/products') },
          ),
        )}
        className={`${panelCard} max-w-3xl space-y-4 p-6`}
      >
        <Field label="عنوان کامل محصول" error={errors.title?.message} required>
          <Input {...register('title')} placeholder="مثلاً گوشی موبایل سامسونگ مدل Galaxy S24 ظرفیت 256 گیگابایت" invalid={!!errors.title} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="دسته‌بندی" error={errors.category_id?.message} required>
            <select
              className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              value={watch('category_id')}
              onChange={(e) => setValue('category_id', Number(e.target.value), { shouldValidate: true })}
            >
              <option value={0}>انتخاب کنید</option>
              {[...(categories.data?.data ?? [])]
                .sort((a, b) => (a.parent_id ?? 0) - (b.parent_id ?? 0))
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.parent_id ? '— ' : ''}{c.title}
                  </option>
                ))}
            </select>
          </Field>
          <Field label="برند">
            <select
              className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              value={watch('brand_id') ?? 0}
              onChange={(e) => setValue('brand_id', Number(e.target.value) || undefined)}
            >
              <option value={0}>بدون برند</option>
              {brands.data?.data.map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}
            </select>
          </Field>
          <Field label="قیمت (تومان)" error={errors.price?.message} required>
            <Input type="number" min={1000} step={1000} {...register('price', { valueAsNumber: true })} dir="ltr" invalid={!!errors.price} />
          </Field>
          <Field label="قیمت با تخفیف (اختیاری)" error={errors.sale_price?.message}>
            <Input type="number" min={1000} step={1000} {...register('sale_price', { valueAsNumber: true })} dir="ltr" placeholder="خالی = بدون تخفیف" />
          </Field>
          <Field label="موجودی اولیه" error={errors.stock?.message} required>
            <Input type="number" min={0} {...register('stock', { valueAsNumber: true })} dir="ltr" invalid={!!errors.stock} />
          </Field>
        </div>

        <Field label="توضیح کوتاه" error={errors.short_description?.message}>
          <textarea {...register('short_description')} rows={3} className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand dark:border-zinc-700 dark:bg-zinc-900" />
        </Field>

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={mutations.create.isPending}>
            <PackagePlus size={16} /> ایجاد محصول
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>انصراف</Button>
        </div>
      </form>
    </div>
  );
}
