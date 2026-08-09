import { z } from 'zod';

/** الگوهای مشترک */
export const phoneSchema = z
  .string()
  .regex(/^09\d{9}$/, 'شماره موبایل باید با ۰۹ شروع و ۱۱ رقم باشد');

export const passwordSchema = z.string().min(6, 'رمز عبور حداقل ۶ کاراکتر است');

export const loginSchema = z.object({
  identity: z.string().min(3, 'موبایل یا ایمیل را وارد کنید'),
  password: z.string().min(1, 'رمز عبور را وارد کنید'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const otpSchema = z.object({
  code: z.string().regex(/^\d{5}$/, 'کد ۵ رقمی را وارد کنید'),
});
export type OtpInput = z.infer<typeof otpSchema>;

export const registerSchema = z
  .object({
    first_name: z.string().min(2, 'نام حداقل ۲ حرف است'),
    last_name: z.string().min(2, 'نام خانوادگی حداقل ۲ حرف است'),
    phone: phoneSchema,
    email: z.string().email('ایمیل معتبر نیست').optional().or(z.literal('')),
    password: passwordSchema,
    password_confirmation: z.string(),
  })
  .refine((v) => v.password === v.password_confirmation, {
    message: 'تکرار رمز عبور مطابقت ندارد',
    path: ['password_confirmation'],
  });
export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotSchema = z.object({ identity: z.string().min(3, 'موبایل یا ایمیل را وارد کنید') });
export type ForgotInput = z.infer<typeof forgotSchema>;

export const resetSchema = z
  .object({
    code: z.string().regex(/^\d{5}$/, 'کد ۵ رقمی را وارد کنید'),
    password: passwordSchema,
    password_confirmation: z.string(),
  })
  .refine((v) => v.password === v.password_confirmation, {
    message: 'تکرار رمز عبور مطابقت ندارد',
    path: ['password_confirmation'],
  });
export type ResetInput = z.infer<typeof resetSchema>;

export const addressSchema = z.object({
  title: z.string().min(2, 'عنوان آدرس را وارد کنید (مثل: منزل)'),
  province_id: z.number({ invalid_type_error: 'استان را انتخاب کنید' }).min(1, 'استان را انتخاب کنید'),
  city_id: z.number({ invalid_type_error: 'شهر را انتخاب کنید' }).min(1, 'شهر را انتخاب کنید'),
  full_address: z.string().min(10, 'آدرس کامل حداقل ۱۰ حرف است'),
  postal_code: z.string().regex(/^\d{10}$/, 'کد پستی ۱۰ رقم است'),
  receiver_name: z.string().min(3, 'نام گیرنده را وارد کنید'),
  receiver_phone: phoneSchema,
  is_default: z.boolean().optional(),
});
export type AddressInput = z.infer<typeof addressSchema>;

export const profileSchema = z.object({
  first_name: z.string().min(2, 'نام حداقل ۲ حرف است'),
  last_name: z.string().min(2, 'نام خانوادگی حداقل ۲ حرف است'),
  email: z.string().email('ایمیل معتبر نیست').optional().or(z.literal('')),
  national_code: z.string().regex(/^\d{10}$/, 'کد ملی ۱۰ رقم است').optional().or(z.literal('')),
  birth_date: z.string().optional(),
  gender: z.enum(['male', 'female']).optional(),
});
export type ProfileInput = z.infer<typeof profileSchema>;

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, 'رمز فعلی را وارد کنید'),
    password: passwordSchema,
    password_confirmation: z.string(),
  })
  .refine((v) => v.password === v.password_confirmation, {
    message: 'تکرار رمز عبور مطابق نیست',
    path: ['password_confirmation'],
  });
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const sellerRegisterSchema = z.object({
  shop_name: z.string().min(2, 'نام فروشگاه حداقل ۲ حرف است'),
  national_id: z.string().min(10, 'شناسه ملی/کد ملی حداقل ۱۰ رقم است'),
  phone: z.string().min(8, 'تلفن فروشگاه معتبر نیست'),
  email: z.string().email('ایمیل معتبر نیست'),
  province_id: z.number({ invalid_type_error: 'استان را انتخاب کنید' }).min(1, 'استان را انتخاب کنید'),
  city_id: z.number({ invalid_type_error: 'شهر را انتخاب کنید' }).min(1, 'شهر را انتخاب کنید'),
  address: z.string().min(10, 'آدرس فروشگاه حداقل ۱۰ حرف است'),
  shaba_number: z.string().min(24, 'شماره شبا حداقل ۲۴ کاراکتر (با IR) است'),
});
export type SellerRegisterInput = z.infer<typeof sellerRegisterSchema>;
