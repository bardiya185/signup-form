import type { NextRequest } from 'next/server';
import { apiHandler } from '@/server/errors';
import { ok } from '@/server/http';
import { requireWarehouse } from '@/server/guards';
import { warehouseDashboard } from '@/server/services/warehouse.service';

export const dynamic = 'force-dynamic';

// GET /api/v1/warehouse/dashboard — آمار کلی انبار
export const GET = apiHandler(async (req: NextRequest) => {
  requireWarehouse(req);
  return ok(warehouseDashboard());
});
