/**
 * ─── Resources بخش دوم (کاربر، سبد، سفارش، پرداخت، ...) ───
 */
import { db } from './db';
import { toVariantDto } from './serializers';
import type * as D from '@/types/domain';
import type { ProductCardDto, VariantDto } from '@/types/dto';

// ─── نگاشت وضعیت‌ها به فارسی ───
export const ORDER_STATUS_FA: Record<D.OrderStatus, string> = {
  pending: 'در انتظار بررسی', processing: 'در حال پردازش', shipped: 'ارسال شده',
  delivered: 'تحویل شده', cancelled: 'لغو شده', returned: 'مرجوع شده',
};
export const PAYMENT_STATUS_FA: Record<D.PaymentStatus, string> = {
  pending: 'در انتظار پرداخت', paid: 'پرداخت شده', failed: 'پرداخت ناموفق', refunded: 'بازگشت وجه',
};
export const PAYMENT_METHOD_FA: Record<D.PaymentMethod, string> = {
  zarinpal: 'زرین‌پال', mellat: 'بانک ملت', saman: 'بانک سامان', wallet: 'کیف پول',
};
export const TICKET_STATUS_FA: Record<D.TicketStatus, string> = {
  open: 'باز', answered: 'پاسخ داده شده', closed: 'بسته شده',
};
export const TICKET_PRIORITY_FA: Record<D.TicketPriority, string> = {
  low: 'کم', medium: 'متوسط', high: 'زیاد', urgent: 'فوری',
};
export const TICKET_DEPARTMENT_FA: Record<D.TicketDepartment, string> = {
  orders: 'پیگیری سفارش', payments: 'مالی و پرداخت', returns: 'بازگشت کالا',
  technical: 'فنی', general: 'عمومی',
};
export const USER_STATUS_FA: Record<D.UserStatus, string> = {
  active: 'فعال', banned: 'مسدود', inactive: 'غیرفعال',
};
export const SELLER_STATUS_FA: Record<D.SellerStatus, string> = {
  pending: 'در انتظار تایید', approved: 'تایید شده', rejected: 'رد شده', suspended: 'معلق',
};

const userName = (u: D.User) => `${u.first_name} ${u.last_name}`.trim() || u.phone;
export const userNameOf = (id: number): string => {
  const u = db.users.find((x) => x.id === id);
  return u ? userName(u) : 'کاربر گینان‌کالا';
};

// ─── کاربر ───
export const toUserDto = (u: D.User) => ({
  id: u.id,
  firstName: u.first_name,
  lastName: u.last_name,
  fullName: userName(u),
  email: u.email,
  phone: u.phone,
  nationalCode: u.national_code,
  avatar: u.avatar,
  birthDate: u.birth_date,
  gender: u.gender,
  emailVerifiedAt: u.email_verified_at,
  phoneVerifiedAt: u.phone_verified_at,
  role: u.role,
  status: u.status,
  statusFa: USER_STATUS_FA[u.status],
  createdAt: u.created_at,
});

// ─── آدرس ───
export const toAddressDto = (a: D.Address) => {
  const province = db.provinces.find((p) => p.id === a.province_id);
  const city = db.cities.find((c) => c.id === a.city_id);
  return {
    id: a.id,
    title: a.title,
    province: province ? { id: province.id, name: province.name } : null,
    city: city ? { id: city.id, name: city.name } : null,
    fullAddress: a.full_address,
    postalCode: a.postal_code,
    lat: a.lat,
    lng: a.lng,
    receiverName: a.receiver_name,
    receiverPhone: a.receiver_phone,
    isDefault: a.is_default,
  };
};

// ─── سبد خرید ───
export interface CartTotals {
  itemsCount: number;
  subtotal: number;
  discount: number;
  couponDiscount: number;
  couponCode: string | null;
  shippingCost: number | null;
  total: number;
  freeShippingThreshold: number;
  remainingForFreeShipping: number;
}

export interface CartItemDto {
  id: number;
  product: Pick<ProductCardDto, 'id' | 'slug' | 'title' | 'image'>;
  variant: VariantDto;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CartDto {
  id: number | null;
  items: CartItemDto[];
  totals: CartTotals;
}

export const toOrderItemDto = (item: D.OrderItem) => {
  const variant = db.product_variants.find((v) => v.id === item.product_variant_id);
  const product = variant ? db.products.find((p) => p.id === variant.product_id) : undefined;
  const image = product
    ? db.product_images.find((i) => i.product_id === product.id && i.is_primary)?.image_path ?? null
    : null;
  return {
    id: item.id,
    productVariantId: item.product_variant_id,
    productTitle: item.product_title,
    productSlug: product?.slug ?? null,
    image,
    variantInfo: item.variant_info,
    quantity: item.quantity,
    unitPrice: item.unit_price,
    totalPrice: item.total_price,
  };
};

// ─── سفارش ───
export const toOrderDto = (o: D.Order, withItems = true) => ({
  id: o.id,
  orderNumber: o.order_number,
  status: o.status,
  statusFa: ORDER_STATUS_FA[o.status],
  paymentStatus: o.payment_status,
  paymentStatusFa: PAYMENT_STATUS_FA[o.payment_status],
  paymentMethod: o.payment_method,
  paymentMethodFa: PAYMENT_METHOD_FA[o.payment_method],
  subtotal: o.subtotal,
  shippingCost: o.shipping_cost,
  taxAmount: o.tax_amount,
  discountAmount: o.discount_amount,
  totalAmount: o.total_amount,
  couponDiscount: o.coupon_discount,
  notes: o.notes,
  cancellationReason: o.cancellation_reason,
  address: toAddressDto(db.addresses.find((a) => a.id === o.address_id) as D.Address),
  items: withItems
    ? db.order_items.filter((i) => i.order_id === o.id).map(toOrderItemDto)
    : [],
  itemsCount: db.order_items.filter((i) => i.order_id === o.id).reduce((acc, i) => acc + i.quantity, 0),
  canCancel: ['pending', 'processing'].includes(o.status) && o.payment_status !== 'refunded',
  canReturn: o.status === 'delivered',
  buyerName: userNameOf(o.user_id),
  shippedAt: o.shipped_at,
  deliveredAt: o.delivered_at,
  createdAt: o.created_at,
});

export const toOrderHistoryDto = (h: D.OrderStatusHistory) => ({
  id: h.id,
  oldStatus: h.old_status ? ORDER_STATUS_FA[h.old_status] : null,
  newStatus: ORDER_STATUS_FA[h.new_status],
  description: h.description,
  actor: h.changed_by ? userNameOf(h.changed_by) : 'سیستم',
  createdAt: h.created_at,
});

// ─── پرداخت و کیف پول ───
export const toPaymentDto = (p: D.Payment) => {
  const order = p.order_id ? db.orders.find((o) => o.id === p.order_id) : null;
  return {
    id: p.id,
    amount: p.amount,
    method: p.method,
    methodFa: PAYMENT_METHOD_FA[p.method],
    status: p.status,
    statusFa: p.status === 'success' ? 'موفق' : p.status === 'pending' ? 'در انتظار' : p.status === 'failed' ? 'ناموفق' : 'بازگشت وجه',
    transactionId: p.transaction_id,
    refNumber: p.ref_number,
    orderNumber: order?.order_number ?? null,
    isWalletCharge: !p.order_id,
    paidAt: p.paid_at,
    createdAt: p.created_at,
  };
};

export const toWalletTransactionDto = (t: D.WalletTransaction) => ({
  id: t.id,
  type: t.type,
  typeFa: t.type === 'deposit' ? 'شارژ کیف پول' : 'برداشت از کیف پول',
  amount: t.amount,
  description: t.description,
  referenceId: t.reference_id,
  createdAt: t.created_at,
});

// ─── اعلان ───
export const toNotificationDto = (n: D.AppNotification) => ({
  id: n.id,
  type: n.type,
  title: n.title,
  body: n.body,
  data: n.data,
  isRead: !!n.read_at,
  createdAt: n.created_at,
});

// ─── تیکت ───
export const toTicketMessageDto = (m: D.TicketMessage) => ({
  id: m.id,
  body: m.body,
  attachments: m.attachments,
  isAdmin: m.is_admin,
  authorName: userNameOf(m.user_id),
  createdAt: m.created_at,
});

export const toTicketDto = (t: D.Ticket, withMessages = true) => ({
  id: t.id,
  subject: t.subject,
  department: t.department,
  departmentFa: TICKET_DEPARTMENT_FA[t.department],
  priority: t.priority,
  priorityFa: TICKET_PRIORITY_FA[t.priority],
  status: t.status,
  statusFa: TICKET_STATUS_FA[t.status],
  orderNumber: t.order_id ? db.orders.find((o) => o.id === t.order_id)?.order_number ?? null : null,
  requesterName: userNameOf(t.user_id),
  messages: withMessages
    ? db.ticket_messages.filter((m) => m.ticket_id === t.id)
        .sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at))
        .map(toTicketMessageDto)
    : [],
  lastMessageAt: db.ticket_messages
    .filter((m) => m.ticket_id === t.id)
    .map((m) => +new Date(m.created_at))
    .reduce((max, ts) => Math.max(max, ts), +new Date(t.created_at)) || t.created_at,
  createdAt: t.created_at,
});

// ─── بلاگ ───
export const toBlogDto = (p: D.BlogPost, withBody = false) => ({
  id: p.id,
  title: p.title,
  slug: p.slug,
  excerpt: p.excerpt,
  body: withBody ? p.body : null,
  image: p.image,
  authorName: userNameOf(p.author_id),
  viewCount: p.view_count,
  publishedAt: p.published_at,
});

// ─── کوپن ───
export const toCouponDto = (c: D.Coupon) => ({
  id: c.id,
  code: c.code,
  type: c.type,
  typeFa: c.type === 'percentage' ? 'درصدی' : 'مبلغی',
  value: c.value,
  maxDiscount: c.max_discount,
  minOrderAmount: c.min_order_amount,
  usageLimit: c.usage_limit,
  usedCount: c.used_count,
  perUserLimit: c.per_user_limit,
  startsAt: c.starts_at,
  expiresAt: c.expires_at,
  isActive: c.is_active,
  applicableCategories: c.applicable_categories,
  applicableProducts: c.applicable_products,
});

// ─── فروشنده ───
export const toSellerDto = (s: D.Seller) => ({
  id: s.id,
  shopName: s.shop_name,
  slug: s.slug,
  logo: s.logo,
  description: s.description,
  phone: s.phone,
  email: s.email,
  nationalId: s.national_id,
  commissionRate: s.commission_rate,
  status: s.status,
  statusFa: SELLER_STATUS_FA[s.status],
  rating: s.rating,
  ownerName: userNameOf(s.user_id),
  createdAt: s.created_at,
});

export const toSettlementDto = (s: D.SellerSettlement) => ({
  id: s.id,
  amount: s.amount,
  status: s.status,
  statusFa: s.status === 'paid' ? 'پرداخت شده' : 'در انتظار پرداخت',
  paidAt: s.paid_at,
  reference: s.reference,
  createdAt: s.created_at,
});

export const toActivityLogDto = (l: D.ActivityLog) => ({
  id: l.id,
  action: l.action,
  subjectType: l.subject_type,
  subjectId: l.subject_id,
  description: l.description,
  actorName: l.user_id ? userNameOf(l.user_id) : 'سیستم',
  createdAt: l.created_at,
});

// ─── توکن احراز هویت ───
export function issueToken(userId: number, name = 'web'): string {
  const token = db.personal_access_tokens;
  const id = token.length ? Math.max(...token.map((t) => t.id)) + 1 : 1;
  const value = crypto.randomUUID().replaceAll('-', '') + crypto.randomUUID().replaceAll('-', '');
  token.push({
    id, user_id: userId, token: value, name, abilities: ['*'],
    last_used_at: null,
    expires_at: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
    revoked_at: null, created_at: new Date().toISOString(),
  });
  return value;
}

export function revokeToken(raw: string): void {
  const t = db.personal_access_tokens.find((x) => x.token === raw);
  if (t) t.revoked_at = new Date().toISOString();
}

export function logActivity(userId: number | null, action: string, subjectType: string | null = null, subjectId: number | null = null, description: string | null = null): void {
  const logs = db.activity_logs;
  const id = logs.length ? Math.max(...logs.map((l) => l.id)) + 1 : 1;
  logs.push({ id, user_id: userId, action, subject_type: subjectType, subject_id: subjectId, description, created_at: new Date().toISOString() });
}

export function notify(userId: number, type: D.NotificationType, title: string, body: string, data: D.Json | null = null): void {
  const list = db.notifications;
  const id = list.length ? Math.max(...list.map((n) => n.id)) + 1 : 1;
  list.push({ id, user_id: userId, type, title, body, data, read_at: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
}
