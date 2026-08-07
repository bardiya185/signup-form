import { ok } from '@/server/http';
import { activeOffers } from '@/server/repositories/content.repository';
import type { SpecialOfferType } from '@/types/domain';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/v1/offers/incredible?type=incredible_offers — پیشنهادهای شگفت‌انگیز فعال
export function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('type');
  const type: SpecialOfferType = raw === 'daily_deals' ? 'daily_deals' : 'incredible_offers';
  return ok({ offers: activeOffers(type), endsAt: activeOffers(type)[0]?.expiresAt ?? null });
}
