'use client';
/**
 * تنظیمات فروشگاه — فرم کلید/مقدار + ذخیره
 */
import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { useAdminSettings, useAdminUpdateSettings } from '@/hooks/admin';
import { PanelTitle, panelCard } from '@/components/admin/panel-shell';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { PageLoading } from '@/components/ui/states';
import { cn } from '@/utils/cn';

const FIELDS: { key: string; label: string; hint?: string; ltr?: boolean; type?: string }[] = [
  { key: 'site_name', label: 'نام فروشگاه' },
  { key: 'site_description', label: 'توضیح کوتاه فروشگاه' },
  { key: 'support_phone', label: 'تلفن پشتیبانی', ltr: true },
  { key: 'support_email', label: 'ایمیل پشتیبانی', ltr: true },
  { key: 'free_shipping_threshold', label: 'حد آستانه ارسال رایگان (تومان)', ltr: true, type: 'number', hint: 'اقساط بالاتر از این مبلغ بدون هزینه ارسال می‌شود' },
  { key: 'default_shipping_method_id', label: 'شناسه روش ارسال پیش‌فرض', ltr: true, type: 'number' },
  { key: 'return_period_days', label: 'مهلت بازگشت کالا (روز)', ltr: true, type: 'number' },
  { key: 'incredible_offers_enabled', label: 'پیشنهاد شگفت‌انگیز فعال باشد؟', ltr: true, hint: 'true یا false' },
  { key: 'maintenance_mode', label: 'حالت تعمیر و نگهداشت', ltr: true, hint: 'true یا false' },
];

export default function AdminSettingsPage() {
  const settings = useAdminSettings();
  const update = useAdminUpdateSettings();
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (settings.data?.data) setForm(settings.data.data);
  }, [settings.data]);

  if (settings.isLoading) return <PageLoading />;

  return (
    <div className="mx-auto max-w-2xl">
      <PanelTitle title="تنظیمات فروشگاه" description="این مقادیر در کل سایت (سربرگ، سبد خرید و…) اثر می‌گذارند" />

      <form
        className={cn('space-y-4 p-6', panelCard)}
        onSubmit={(e) => {
          e.preventDefault();
          update.mutate(form);
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {FIELDS.map(({ key, label, hint, ltr, type }) => (
            <Field key={key} label={label} hint={hint} className={cn(key === 'site_description' && 'sm:col-span-2')}>
              <Input
                type={type ?? 'text'}
                dir={ltr ? 'ltr' : undefined}
                value={form[key] ?? ''}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            </Field>
          ))}
        </div>
        <div className="flex justify-end border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <Button type="submit" loading={update.isPending}>
            <Save size={15} /> ذخیره تنظیمات
          </Button>
        </div>
      </form>
    </div>
  );
}
