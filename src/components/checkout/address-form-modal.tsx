'use client';
/**
 * مودال فرم آدرس — RHF + Zod، وابسته‌سازی استان → شهر، حالت ایجاد/ویرایش
 */
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Field, Input, PhoneInput, inputClass } from '@/components/ui/input';
import { useCities, useCreateAddress, useProvinces, useUpdateAddress } from '@/hooks/account';
import { addressSchema, type AddressInput } from '@/lib/validators';
import type { AddressDto } from '@/types/account';

export function AddressFormModal({
  open,
  onClose,
  address,
}: {
  open: boolean;
  onClose: () => void;
  address?: AddressDto | null;
}) {
  const provinces = useProvinces();
  const create = useCreateAddress();
  const update = useUpdateAddress();

  const {
    register, handleSubmit, watch, setValue, reset,
    formState: { errors, isSubmitting },
  } = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      title: '', province_id: 0, city_id: 0, full_address: '',
      postal_code: '', receiver_name: '', receiver_phone: '', is_default: false,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        title: address?.title ?? '',
        province_id: address?.province?.id ?? 0,
        city_id: address?.city?.id ?? 0,
        full_address: address?.fullAddress ?? '',
        postal_code: address?.postalCode ?? '',
        receiver_name: address?.receiverName ?? '',
        receiver_phone: address?.receiverPhone ?? '',
        is_default: address?.isDefault ?? false,
      });
    }
  }, [open, address, reset]);

  const provinceId = watch('province_id');
  const cities = useCities(provinceId || undefined);

  const onSubmit = handleSubmit((values) => {
    const done = { onSuccess: onClose };
    if (address) update.mutate({ id: address.id, ...values }, done);
    else create.mutate(values, done);
  });
  const loading = isSubmitting || create.isPending || update.isPending;

  return (
    <Modal open={open} onClose={onClose} title={address ? 'ویرایش آدرس' : 'افزودن آدرس جدید'}>
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="عنوان آدرس (مثل: منزل، محل کار)" error={errors.title?.message} required>
          <Input {...register('title')} placeholder="منزل" invalid={!!errors.title} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="استان" error={errors.province_id?.message} required>
            <select
              className={inputClass(!!errors.province_id)}
              value={provinceId}
              onChange={(e) => { setValue('province_id', Number(e.target.value), { shouldValidate: true }); setValue('city_id', 0); }}
            >
              <option value={0}>انتخاب کنید</option>
              {provinces.data?.data.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Field>
          <Field label="شهر" error={errors.city_id?.message} required>
            <select
              className={inputClass(!!errors.city_id)}
              disabled={!provinceId || cities.isLoading}
              value={watch('city_id')}
              onChange={(e) => setValue('city_id', Number(e.target.value), { shouldValidate: true })}
            >
              <option value={0}>{cities.isLoading ? 'در حال بارگذاری…' : 'انتخاب کنید'}</option>
              {cities.data?.data.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
        </div>
        <Field label="آدرس کامل" error={errors.full_address?.message} required>
          <textarea {...register('full_address')} rows={2} className={inputClass(!!errors.full_address)} placeholder="خیابان، کوچه، پلاک، واحد" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="کد پستی" error={errors.postal_code?.message} required>
            <Input {...register('postal_code')} inputMode="numeric" maxLength={10} dir="ltr" invalid={!!errors.postal_code} />
          </Field>
          <Field label="تلفن گیرنده" error={errors.receiver_phone?.message} required>
            <PhoneInput {...register('receiver_phone')} invalid={!!errors.receiver_phone} />
          </Field>
        </div>
        <Field label="نام و نام خانوادگی گیرنده" error={errors.receiver_name?.message} required>
          <Input {...register('receiver_name')} invalid={!!errors.receiver_name} />
        </Field>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
          <input type="checkbox" {...register('is_default')} className="size-4 rounded accent-brand" />
          به‌عنوان آدرس پیش‌فرض ثبت شود
        </label>
        <Button type="submit" className="w-full" size="lg" loading={loading}>
          {address ? 'ذخیره تغییرات' : 'ثبت آدرس'}
        </Button>
      </form>
    </Modal>
  );
}
