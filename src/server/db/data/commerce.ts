import type { Coupon, ShippingMethod, SpecialOffer } from '@/types/domain';

// ─── پیشنهادهای شگفت‌انگیز و فروش ویژه ───
const offer = (
  id: number, product_variant_id: number, discount_percentage: number,
  discount_price: number, stock: number, sold_count: number,
  type: SpecialOffer['type'] = 'incredible_offers',
): SpecialOffer => ({
  id, title: type === 'incredible_offers' ? 'پیشنهاد شگفت‌انگیز' : 'فروش روزانه',
  type, product_variant_id, discount_percentage, discount_price,
  stock, sold_count,
  starts_at: '2026-08-06T00:00:00Z', expires_at: '2026-08-10T23:59:59Z',
  is_active: true, created_at: '', updated_at: '',
});

export const specialOffers: SpecialOffer[] = [
  offer(1, 19, 12, 34700000, 8, 24),   // PS5 Slim
  offer(2, 24, 18, 3990000, 30, 58),   // مخلوط‌کن فیلیپس
  offer(3, 12, 13, 16400000, 12, 31),  // سونی WH-1000XM5 کرم
  offer(4, 36, 22, 1290000, 40, 92),   // سرم ویتامین C
  offer(5, 29, 20, 5900000, 15, 43),   // آدیداس اولترابوست سفید
  offer(6, 1, 6, 71900000, 5, 12),     // آیفون ۱۵ پرو تیتانیوم
  offer(7, 18, 16, 1590000, 20, 71, 'daily_deals'),  // می‌بند ۹ صورتی
  offer(8, 35, 23, 189000, 50, 134, 'daily_deals'),  // کتاب کیمیاگر
];

// ─── کوپن‌های تخفیف ───
export const coupons: Coupon[] = [
  {
    id: 1, code: 'GINAN10', type: 'percentage', value: 10, max_discount: 150000,
    min_order_amount: 500000, usage_limit: 1000, used_count: 142, per_user_limit: 1,
    starts_at: '2026-08-01T00:00:00Z', expires_at: '2026-09-01T00:00:00Z',
    is_active: true, applicable_categories: null, applicable_products: null,
    created_at: '', updated_at: '',
  },
  {
    id: 2, code: 'SALAM100', type: 'fixed', value: 100000, max_discount: null,
    min_order_amount: 1000000, usage_limit: 500, used_count: 37, per_user_limit: 1,
    starts_at: '2026-08-01T00:00:00Z', expires_at: '2026-08-20T00:00:00Z',
    is_active: true, applicable_categories: null, applicable_products: null,
    created_at: '', updated_at: '',
  },
  {
    id: 3, code: 'BOOK20', type: 'percentage', value: 20, max_discount: 200000,
    min_order_amount: 200000, usage_limit: null, used_count: 65, per_user_limit: 3,
    starts_at: '2026-07-20T00:00:00Z', expires_at: '2026-08-15T00:00:00Z',
    is_active: true, applicable_categories: [17], applicable_products: null,
    created_at: '', updated_at: '',
  },
];

// ─── روش‌های ارسال ───
export const shippingMethods: ShippingMethod[] = [
  { id: 1, title: 'پست پیشتاز', cost: 45000, estimated_days: 3, is_active: true, created_at: '', updated_at: '' },
  { id: 2, title: 'تیپاکس', cost: 69000, estimated_days: 2, is_active: true, created_at: '', updated_at: '' },
  { id: 3, title: 'تحویل اکسپرس (فقط تهران)', cost: 99000, estimated_days: 1, is_active: true, created_at: '', updated_at: '' },
];
