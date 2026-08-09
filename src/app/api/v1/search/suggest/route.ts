import { ok } from '@/server/http';
import { suggest } from '@/server/repositories/search.repository';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/v1/search/suggest?q=آیفون — پیشنهاد جستجو (مثل دیجی‌کالا)
export function GET(req: NextRequest) {
  return ok(suggest(req.nextUrl.searchParams.get('q') ?? ''));
}
