/**
 * ─── دسترسی امن به storage (localStorage با fallback درون‌حافظه‌ای) ───
 *
 * در محیط‌های sandbox / iframe (مانند پیش‌نمایش تعبیه‌شده) دسترسی به
 * `window.localStorage` ممکن است امن نباشد و `SecurityError` پرتاب کند.
 * اگر این اتفاق بیفتد، جریان احراز هویت و فراخوانی‌های API به‌کلی می‌شکند
 * (مثلاً «ثبت‌نام انجام نمی‌شود»). این ماژول یک لایه‌ی مقاوم فراهم می‌کند:
 *  - اگر localStorage در دسترس بود، از همان استفاده می‌کند.
 *  - اگر نبود یا خطا داد، به یک Map درون‌حافظه‌ای برمی‌گردد تا برنامه
 *    هرگز از این بابت از کار نیفتد (در همان نشست مرورگر ماندگار می‌ماند).
 */
const memory = new Map<string, string>();

function hasStorage(): boolean {
  try {
    return typeof window !== 'undefined' && !!window.localStorage;
  } catch {
    return false;
  }
}

export function storageGet(key: string): string | null {
  try {
    if (hasStorage()) {
      const v = window.localStorage.getItem(key);
      if (v !== null) return v;
    }
  } catch {
    /* localStorage مسدود شده — از memory استفاده کن */
  }
  return memory.get(key) ?? null;
}

export function storageSet(key: string, value: string): void {
  try {
    if (hasStorage()) window.localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
  memory.set(key, value);
}

export function storageRemove(key: string): void {
  try {
    if (hasStorage()) window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
  memory.delete(key);
}
