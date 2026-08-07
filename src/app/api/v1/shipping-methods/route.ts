import { ok } from '@/server/http';
import { activeShippingMethods } from '@/server/repositories/content.repository';

// GET /api/v1/shipping-methods — روش‌های ارسال فعال
export function GET() {
  return ok(activeShippingMethods());
}
