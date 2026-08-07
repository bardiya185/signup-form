import { err429 } from './errors';

/**
 * Rate Limiting سبک Laravel Throttle — پنجره لغزان درون‌حافظه‌ای.
 * use: throttle(req, 'otp', 3, 60)  → ۳ ریکوئست در ۶۰ ثانیه
 */

interface Bucket { hits: number[] }
const buckets = new Map<string, Bucket>();

function clientKey(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  const ip = fwd?.split(',')[0]?.trim() || 'local';
  return ip;
}

export function throttle(req: Request, bucket: string, max: number, windowSec: number): void {
  const key = `${clientKey(req)}:${bucket}`;
  const now = Date.now();
  const windowMs = windowSec * 1000;

  const b = buckets.get(key) ?? { hits: [] };
  b.hits = b.hits.filter((t) => now - t < windowMs);
  if (b.hits.length >= max) throw err429();
  b.hits.push(now);
  buckets.set(key, b);
}

// پاک‌سازی دوره‌ای حافظه (هر ۱۰ دقیقه)
let lastSweep = 0;
export function sweepBuckets(): void {
  const now = Date.now();
  if (now - lastSweep < 600_000) return;
  lastSweep = now;
  for (const [key, b] of buckets) {
    b.hits = b.hits.filter((t) => now - t < 3600_000);
    if (!b.hits.length) buckets.delete(key);
  }
}
