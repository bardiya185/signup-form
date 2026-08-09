import { err422 } from './errors';

/**
 * اعتبارسنجی سبک Form Request لاراول با پیام‌های فارسی.
 * مثال:
 *   const data = validate(body, {
 *     phone: { label: 'شماره موبایل', required: true, phone: true },
 *     quantity: { label: 'تعداد', required: true, type: 'number', min: 1, max: 10 },
 *   });
 */

export interface Rule {
  label?: string;
  required?: true;
  type?: 'string' | 'number' | 'boolean' | 'array';
  min?: number; // رشته: طول | عدد: مقدار | آرایه: طول
  max?: number;
  email?: true;
  phone?: true; // موبایل ایران 09xxxxxxxxx
  en?: readonly string[]; // مقادیر مجاز
}

const DEFAULT_LABELS: Record<string, string> = {
  phone: 'شماره موبایل', password: 'رمز عبور', current_password: 'رمز عبور فعلی',
  password_confirmation: 'تکرار رمز عبور', email: 'ایمیل', first_name: 'نام',
  last_name: 'نام خانوادگی', national_code: 'کد ملی', title: 'عنوان',
  full_address: 'آدرس کامل', postal_code: 'کد پستی', receiver_name: 'نام گیرنده',
  receiver_phone: 'شماره تماس گیرنده', quantity: 'تعداد', code: 'کد',
  amount: 'مبلغ', subject: 'موضوع', message: 'پیام', body: 'متن',
  rating: 'امتیاز', question: 'پرسش', reason: 'دلیل', shop_name: 'نام فروشگاه',
  identity: 'شماره موبایل یا ایمیل', price: 'قیمت', stock: 'موجودی',
};

export type Validated<R extends Record<string, Rule>> = {
  [K in keyof R]: R[K]['type'] extends 'number' ? number
    : R[K]['type'] extends 'boolean' ? boolean
    : R[K]['type'] extends 'array' ? unknown[]
    : string;
};

const PHONE_RE = /^09\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validate<R extends Record<string, Rule>>(
  body: Record<string, unknown> | null | undefined,
  rules: R,
): Validated<R> {
  const src = body ?? {};
  const errors: Record<string, string[]> = {};
  const out: Record<string, unknown> = {};

  for (const [field, rule] of Object.entries(rules)) {
    const label = rule.label ?? DEFAULT_LABELS[field] ?? field;
    const raw = src[field];
    const type = rule.type ?? 'string';
    const empty = raw == null || raw === '';

    if (empty) {
      if (rule.required) errors[field] = [`فیلد ${label} الزامی است`];
      continue;
    }

    let value: unknown = raw;

    if (type === 'number') {
      const n = Number(raw);
      if (!Number.isFinite(n)) { errors[field] = [`فیلد ${label} باید عدد باشد`]; continue; }
      value = n;
      if (rule.min != null && n < rule.min) errors[field] = [`مقدار ${label} باید حداقل ${rule.min} باشد`];
      if (rule.max != null && n > rule.max) errors[field] = [`مقدار ${label} باید حداکثر ${rule.max} باشد`];
    } else if (type === 'boolean') {
      value = raw === true || raw === 'true' || raw === 1 || raw === '1';
    } else if (type === 'array') {
      if (!Array.isArray(raw)) { errors[field] = [`فیلد ${label} باید آرایه باشد`]; continue; }
      if (rule.min != null && raw.length < rule.min) errors[field] = [`تعداد ${label} باید حداقل ${rule.min} باشد`];
      if (rule.max != null && raw.length > rule.max) errors[field] = [`تعداد ${label} باید حداکثر ${rule.max} باشد`];
    } else {
      const s = String(raw).trim();
      value = s;
      if (rule.min != null && s.length < rule.min) errors[field] = [`فیلد ${label} باید حداقل ${rule.min} کاراکتر باشد`];
      if (rule.max != null && s.length > rule.max) errors[field] = [`فیلد ${label} باید حداکثر ${rule.max} کاراکتر باشد`];
      if (rule.email && !EMAIL_RE.test(s)) errors[field] = [`فرمت ${label} معتبر نیست`];
      if (rule.phone && !PHONE_RE.test(s)) errors[field] = [`فرمت ${label} معتبر نیست (مثال: 09123456789)`];
      if (rule.en && !rule.en.includes(s)) errors[field] = [`مقدار ${label} معتبر نیست`];
    }

    if (rule.en && type === 'number') continue;
    if (!(field in errors)) out[field] = value;
  }

  // بررسی تایید رمز — سبک password_confirmation لاراول
  if ('password' in rules && 'password_confirmation' in rules) {
    const pw = src.password as string | undefined;
    const pwc = src.password_confirmation as string | undefined;
    if (pw && pwc !== undefined && pw !== pwc) {
      errors.password_confirmation = ['تکرار رمز عبور با رمز عبور مطابقت ندارد'];
    }
  }

  if (Object.keys(errors).length) throw err422(errors);
  return out as Validated<R>;
}
