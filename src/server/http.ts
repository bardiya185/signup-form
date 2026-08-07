import { NextResponse } from 'next/server';
import type { PaginationMeta } from '@/types/domain';

/** پاسخ موفق — فرمت Laravel API Resources */
export function ok<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json({ data }, init);
}

export function paginationMeta(total: number, page: number, perPage: number): PaginationMeta {
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  return {
    current_page: page,
    last_page: lastPage,
    per_page: perPage,
    total,
    from: total === 0 ? 0 : (page - 1) * perPage + 1,
    to: total === 0 ? 0 : Math.min(page * perPage, total),
  };
}

export function paginated<T>(items: T[], total: number, page: number, perPage: number): NextResponse {
  return NextResponse.json({ data: items, meta: paginationMeta(total, page, perPage) });
}

export function fail(message: string, status = 400, errors?: Record<string, string[]>): NextResponse {
  return NextResponse.json({ message, errors }, { status });
}

export const notFound = (message = 'منبع مورد نظر یافت نشد') => fail(message, 404);

/** خواندن امن عدد از کوئری */
export function intParam(value: string | null, fallback: number): number {
  if (value == null || value.trim() === '') return fallback;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback;
}
