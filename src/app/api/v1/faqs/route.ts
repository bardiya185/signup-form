import { ok } from '@/server/http';
import { activeFaqs } from '@/server/repositories/content.repository';

// GET /api/v1/faqs — سوالات متداول
export function GET() {
  return ok(activeFaqs());
}
