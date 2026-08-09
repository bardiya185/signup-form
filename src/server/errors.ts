import { NextResponse } from 'next/server';
import { persistDb } from '@/server/db';

/** خطای کنترل‌شده API — معادل HttpException لاراول */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors?: Record<string, string[]>,
  ) {
    super(message);
  }
}

export const apiError = (status: number, message: string, errors?: Record<string, string[]>) =>
  new ApiError(status, message, errors);

export const err401 = (message = 'برای دسترسی به این بخش وارد حساب کاربری شوید') => apiError(401, message);
export const err403 = (message = 'شما مجوز انجام این عملیات را ندارید') => apiError(403, message);
export const err404 = (message = 'منبع مورد نظر یافت نشد') => apiError(404, message);
export const err422 = (errors: Record<string, string[]>, message = 'اطلاعات وارد شده معتبر نیست') =>
  apiError(422, message, errors);
export const err429 = (message = 'تعداد درخواست‌های شما بیش از حد مجاز است؛ لطفاً کمی بعد تلاش کنید') =>
  apiError(429, message);

/**
 * رپپر استاندارد روت‌هندلرها — معادل قابلیت Exception Handling لاراول.
 * تمام کنترلرها را در این پوشش می‌گذاریم تا خطاها یکدست JSON شوند.
 */
export function apiHandler<A extends unknown[]>(
  fn: (...args: A) => Promise<Response> | Response,
) {
  return async (...args: A): Promise<Response> => {
    try {
      const res = await fn(...args);
      // write-through به دیتابیس SQLite بعد از هر پاسخ موفق
      try {
        persistDb();
      } catch (pe) {
        console.error('[DB PERSIST]', pe);
      }
      return res;
    } catch (e) {
      if (e instanceof ApiError) {
        return NextResponse.json({ message: e.message, errors: e.errors }, { status: e.status });
      }
      console.error('[API ERROR]', e);
      return NextResponse.json({ message: 'خطای داخلی سرور رخ داد' }, { status: 500 });
    }
  };
}
