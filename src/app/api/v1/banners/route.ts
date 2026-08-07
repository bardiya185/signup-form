import { ok } from '@/server/http';
import { bannersByPosition } from '@/server/repositories/content.repository';
import type { BannerPosition } from '@/types/domain';
import type { NextRequest } from 'next/server';

const POSITIONS: BannerPosition[] = ['hero', 'sidebar', 'category', 'product'];

// GET /api/v1/banners?position=hero
export function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('position') ?? 'hero';
  const position = (POSITIONS.includes(raw as BannerPosition) ? raw : 'hero') as BannerPosition;
  return ok(bannersByPosition(position));
}
