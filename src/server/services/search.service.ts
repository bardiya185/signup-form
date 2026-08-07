import { db } from '../db';
import { queryProducts } from '../repositories/product.repository';
import type { ProductSort } from '@/types/dto';

/** جستجوی کامل — همان موتور فیلتر محصولات + ثبت لاگ */
export function fullSearch(params: {
  q: string; sort: ProductSort; page: number; perPage: number;
}) {
  const { items, total } = queryProducts({
    q: params.q, sort: params.sort, page: params.page, perPage: params.perPage,
  });
  if (params.q.trim().length >= 2) {
    db.search_logs.push({
      id: db.search_logs.length ? Math.max(...db.search_logs.map((l) => l.id)) + 1 : 1,
      user_id: null, query: params.q, results_count: total,
      created_at: new Date().toISOString(),
    });
  }
  return { items, total };
}

/** جستجوهای پرتکرار — ترکیب لاگ واقعی + کلمات پرطرفدار پیش‌فرض */
export function popularSearches(): Array<{ query: string; hits: number }> {
  const curated: Array<{ query: string; hits: number }> = [
    { query: 'آیفون', hits: 980 }, { query: 'پلی استیشن 5', hits: 860 },
    { query: 'هدفون سونی', hits: 720 }, { query: 'لپ تاپ گیمینگ', hits: 640 },
    { query: 'کتاب', hits: 510 }, { query: 'ساعت هوشمند', hits: 430 },
  ];
  const counts = new Map<string, number>();
  db.search_logs.forEach((log) => {
    counts.set(log.query, (counts.get(log.query) ?? 0) + 1);
  });
  const fromLogs = [...counts.entries()]
    .map(([query, hits]) => ({ query, hits }))
    .sort((a, b) => b.hits - a.hits)
    .slice(0, 5);
  const merged = [...fromLogs];
  curated.forEach((c) => {
    if (!merged.some((m) => m.query === c.query)) merged.push(c);
  });
  return merged.slice(0, 8);
}
