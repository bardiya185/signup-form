import { ok } from '@/server/http';
import { listBrands } from '@/server/repositories/catalog.repository';

// GET /api/v1/brands — لیست برندهای فعال
export function GET() {
  return ok(listBrands());
}
