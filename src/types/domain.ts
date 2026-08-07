/**
 * ═══════════════════════════════════════════════════════════════════
 *  گینان‌کالا — مدل‌های دامنه (معادل Eloquent Models لاراول)
 *  این فایل دقیقاً مطابق اسکیمای دیتابیس Laravel 11 تعریف شده است.
 *  هر interface = یک جدول، و نام فیلدها با migration ها یکی است.
 * ═══════════════════════════════════════════════════════════════════
 */

export type ID = number;
export type ISODateString = string;
export type Json = Record<string, unknown>;

// ─────────────────────────────────────────────
// ۱. کاربران و احراز هویت
// ─────────────────────────────────────────────

export type UserStatus = 'active' | 'banned' | 'inactive';
export type UserRole = 'super_admin' | 'admin' | 'seller' | 'customer';
export type Gender = 'male' | 'female';

export interface User {
  id: ID;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string; // unique — ورود با موبایل
  password: string; // hash شده
  national_code: string | null;
  avatar: string | null;
  birth_date: ISODateString | null;
  gender: Gender | null;
  email_verified_at: ISODateString | null;
  phone_verified_at: ISODateString | null;
  status: UserStatus;
  role: UserRole;
  remember_token: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
  deleted_at: ISODateString | null; // softDeletes
}

export interface Address {
  id: ID;
  user_id: ID;
  title: string; // مثل «منزل»، «محل کار»
  province_id: ID;
  city_id: ID;
  full_address: string;
  postal_code: string;
  lat: number | null;
  lng: number | null;
  receiver_name: string;
  receiver_phone: string;
  is_default: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface Province {
  id: ID;
  name: string;
  slug: string;
}

export interface City {
  id: ID;
  province_id: ID;
  name: string;
  slug: string;
}

export interface OtpCode {
  id: ID;
  phone: string;
  code: string;
  expired_at: ISODateString;
  used_at: ISODateString | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

// ─────────────────────────────────────────────
// ۲. محصولات و کاتالوگ
// ─────────────────────────────────────────────

export interface Category {
  id: ID;
  parent_id: ID | null; // self-referencing — زیرشاخه نامحدود
  title: string;
  slug: string;
  icon: string | null;
  image: string | null;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  meta_title: string | null;
  meta_description: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface Brand {
  id: ID;
  title: string;
  slug: string;
  logo: string | null;
  description: string | null;
  is_active: boolean;
  meta_title: string | null;
  meta_description: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export type ProductStatus = 'draft' | 'active' | 'inactive' | 'pending_review';

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm';
}

export interface Product {
  id: ID;
  category_id: ID;
  brand_id: ID | null;
  seller_id: ID | null;
  title: string;
  slug: string;
  sku: string;
  short_description: string | null;
  body: string | null; // rich text / HTML
  status: ProductStatus;
  is_featured: boolean;
  is_digital: boolean;
  weight: number | null; // گرم
  dimensions: ProductDimensions | null;
  meta_title: string | null;
  meta_description: string | null;
  view_count: number;
  created_at: ISODateString;
  updated_at: ISODateString;
  deleted_at: ISODateString | null; // softDeletes
}

export interface ProductVariant {
  id: ID;
  product_id: ID;
  sku: string;
  price: number; // تومان — قیمت اصلی
  sale_price: number | null; // قیمت فروش ویژه
  stock: number;
  max_per_order: number;
  color_id: ID | null;
  size_id: ID | null;
  guarantee_id: ID | null;
  is_active: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface ProductImage {
  id: ID;
  product_id: ID;
  image_path: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface ProductVideo {
  id: ID;
  product_id: ID;
  video_url: string;
  thumbnail: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export type AttributeType = 'text' | 'number' | 'boolean' | 'select';

export interface Attribute {
  id: ID;
  title: string; // مثل «حافظه داخلی»
  type: AttributeType;
  filterable: boolean; // نمایش در فیلترهای دسته‌بندی
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface AttributeValue {
  id: ID;
  attribute_id: ID;
  value: string;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface ProductAttribute {
  id: ID;
  product_id: ID;
  attribute_id: ID;
  attribute_value_id: ID | null; // برای تایپ select
  custom_value: string | null; // برای تایپ text/number
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface Color {
  id: ID;
  name: string;
  hex_code: string;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export type SizeType = 'clothing' | 'shoe' | 'ring' | 'other';

export interface Size {
  id: ID;
  name: string;
  type: SizeType;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface Guarantee {
  id: ID;
  title: string; // مثل «گارانتی ۱۸ ماهه شرکتی»
  months: number;
  description: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export type QuestionStatus = 'pending' | 'answered' | 'rejected';

export interface ProductQuestion {
  id: ID;
  product_id: ID;
  user_id: ID;
  question: string;
  answer: string | null;
  answered_by: ID | null; // user_id پاسخ‌دهنده
  answered_at: ISODateString | null;
  status: QuestionStatus;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface ProductPriceHistory {
  id: ID;
  product_variant_id: ID;
  old_price: number;
  new_price: number;
  created_at: ISODateString;
  updated_at: ISODateString;
}

// ─────────────────────────────────────────────
// ۳. دیدگاه‌ها و امتیازها
// ─────────────────────────────────────────────

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface Review {
  id: ID;
  product_id: ID;
  user_id: ID;
  order_item_id: ID | null; // اگر خریدار باشد
  title: string;
  body: string;
  rating: 1 | 2 | 3 | 4 | 5;
  pros: string[]; // json — نقاط قوت
  cons: string[]; // json — نقاط ضعف
  is_buyer: boolean;
  status: ReviewStatus;
  likes_count: number;
  dislikes_count: number;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export type ReactionType = 'like' | 'dislike';

export interface ReviewReaction {
  id: ID;
  review_id: ID;
  user_id: ID;
  type: ReactionType;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface ReviewImage {
  id: ID;
  review_id: ID;
  image_path: string;
  created_at: ISODateString;
  updated_at: ISODateString;
}

// ─────────────────────────────────────────────
// ۴. سفارش‌ها و تسویه حساب
// ─────────────────────────────────────────────

export interface Cart {
  id: ID;
  user_id: ID | null; // کاربر مهمان → session_id
  session_id: string | null;
  coupon_id: ID | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface CartItem {
  id: ID;
  cart_id: ID;
  product_variant_id: ID;
  quantity: number;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'zarinpal' | 'mellat' | 'saman' | 'wallet';

export interface Order {
  id: ID;
  user_id: ID;
  address_id: ID;
  order_number: string; // unique — مثل GNK-100245
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  coupon_id: ID | null;
  coupon_discount: number;
  notes: string | null;
  shipped_at: ISODateString | null;
  delivered_at: ISODateString | null;
  cancelled_at: ISODateString | null;
  cancellation_reason: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
  deleted_at: ISODateString | null;
}

export interface OrderItemVariantInfo {
  color?: string;
  size?: string;
  guarantee?: string;
  sku: string;
}

export interface OrderItem {
  id: ID;
  order_id: ID;
  product_variant_id: ID;
  product_title: string; // snapshot زمان خرید
  variant_info: OrderItemVariantInfo;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface OrderStatusHistory {
  id: ID;
  order_id: ID;
  old_status: OrderStatus | null;
  new_status: OrderStatus;
  description: string | null;
  changed_by: ID | null; // user_id
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface ShippingMethod {
  id: ID;
  title: string;
  cost: number;
  estimated_days: number;
  is_active: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

// ─────────────────────────────────────────────
// ۵. پرداخت‌ها و کیف پول
// ─────────────────────────────────────────────

export type GatewayStatus = 'pending' | 'success' | 'failed' | 'refunded';

export interface Payment {
  id: ID;
  user_id: ID;
  order_id: ID | null; // null در شارژ کیف پول
  amount: number;
  method: PaymentMethod;
  status: GatewayStatus;
  transaction_id: string | null;
  ref_number: string | null;
  gateway_response: Json | null;
  paid_at: ISODateString | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface Wallet {
  id: ID;
  user_id: ID;
  balance: number;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export type WalletTransactionType = 'deposit' | 'withdraw';

export interface WalletTransaction {
  id: ID;
  wallet_id: ID;
  type: WalletTransactionType;
  amount: number;
  description: string | null;
  reference_id: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

// ─────────────────────────────────────────────
// ۶. تخفیف‌ها و کوپن‌ها
// ─────────────────────────────────────────────

export type CouponType = 'percentage' | 'fixed';

export interface Coupon {
  id: ID;
  code: string; // unique
  type: CouponType;
  value: number; // درصد یا مبلغ ثابت
  max_discount: number | null;
  min_order_amount: number | null;
  usage_limit: number | null;
  used_count: number;
  per_user_limit: number;
  starts_at: ISODateString | null;
  expires_at: ISODateString | null;
  is_active: boolean;
  applicable_categories: ID[] | null; // json
  applicable_products: ID[] | null; // json
  created_at: ISODateString;
  updated_at: ISODateString;
}

export type SpecialOfferType = 'incredible_offers' | 'daily_deals';

// پیشنهاد شگفت‌انگیز / فروش ویژه
export interface SpecialOffer {
  id: ID;
  title: string;
  type: SpecialOfferType;
  product_variant_id: ID;
  discount_percentage: number;
  discount_price: number;
  stock: number;
  sold_count: number;
  starts_at: ISODateString;
  expires_at: ISODateString;
  is_active: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

// ─────────────────────────────────────────────
// ۷. علاقه‌مندی‌ها و مقایسه
// ─────────────────────────────────────────────

export interface Wishlist {
  id: ID;
  user_id: ID;
  product_id: ID;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface CompareList {
  id: ID;
  user_id: ID | null;
  session_id: string | null;
  category_id: ID; // مقایسه فقط درون یک دسته
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface CompareListItem {
  id: ID;
  compare_list_id: ID;
  product_id: ID;
  created_at: ISODateString;
  updated_at: ISODateString;
}

// ─────────────────────────────────────────────
// ۸. اعلان‌ها
// ─────────────────────────────────────────────

export type NotificationType =
  | 'order_status'
  | 'price_drop'
  | 'back_in_stock'
  | 'promotion'
  | 'system';

export interface AppNotification {
  id: ID;
  user_id: ID;
  type: NotificationType;
  title: string;
  body: string;
  data: Json | null; // json — لینک، شناسه سفارش و...
  read_at: ISODateString | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface PushSubscription {
  id: ID;
  user_id: ID;
  endpoint: string;
  keys: Json;
  created_at: ISODateString;
  updated_at: ISODateString;
}

// ─────────────────────────────────────────────
// ۹. مدیریت محتوا (CMS)
// ─────────────────────────────────────────────

export type ContentStatus = 'draft' | 'published' | 'archived';

export interface Page {
  id: ID;
  title: string;
  slug: string;
  body: string;
  status: ContentStatus;
  meta_title: string | null;
  meta_description: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export type BannerPosition = 'hero' | 'sidebar' | 'category' | 'product';

export interface Banner {
  id: ID;
  title: string;
  image: string;
  link: string | null;
  position: BannerPosition;
  sort_order: number;
  starts_at: ISODateString | null;
  expires_at: ISODateString | null;
  is_active: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface Slider {
  id: ID;
  title: string;
  items: SliderItem[]; // json
  position: string;
  is_active: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface SliderItem {
  image: string;
  title?: string;
  link?: string;
}

export interface Menu {
  id: ID;
  title: string;
  location: string; // header / footer_col1 / ...
  items: MenuItem[]; // json
  is_active: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface MenuItem {
  label: string;
  link: string;
  children?: MenuItem[];
}

export type PostStatus = 'draft' | 'published';

export interface BlogPost {
  id: ID;
  author_id: ID;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  image: string | null;
  category_id: ID | null;
  status: PostStatus;
  published_at: ISODateString | null;
  view_count: number;
  meta_title: string | null;
  meta_description: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
  deleted_at: ISODateString | null;
}

export interface Faq {
  id: ID;
  category: string;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

// ─────────────────────────────────────────────
// ۱۰. فروشندگان (مارکت‌پلیس)
// ─────────────────────────────────────────────

export type SellerStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface Seller {
  id: ID;
  user_id: ID;
  shop_name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  national_id: string;
  phone: string;
  email: string;
  province_id: ID;
  city_id: ID;
  address: string;
  shaba_number: string;
  commission_rate: number; // درصد کمیسیون
  status: SellerStatus;
  rating: number;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export type SettlementStatus = 'pending' | 'paid';

export interface SellerSettlement {
  id: ID;
  seller_id: ID;
  amount: number;
  status: SettlementStatus;
  paid_at: ISODateString | null;
  reference: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

// ─────────────────────────────────────────────
// ۱۱. تیکت‌ها و پشتیبانی
// ─────────────────────────────────────────────

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'answered' | 'closed';
export type TicketDepartment =
  | 'orders'
  | 'payments'
  | 'returns'
  | 'technical'
  | 'general';

export interface Ticket {
  id: ID;
  user_id: ID;
  order_id: ID | null;
  department: TicketDepartment;
  subject: string;
  priority: TicketPriority;
  status: TicketStatus;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface TicketMessage {
  id: ID;
  ticket_id: ID;
  user_id: ID;
  body: string;
  attachments: string[]; // json
  is_admin: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

// ─────────────────────────────────────────────
// ۱۲. گزارش‌ها و آنالیتیکس
// ─────────────────────────────────────────────

export interface PageView {
  id: ID;
  url: string;
  user_id: ID | null;
  ip: string;
  user_agent: string;
  created_at: ISODateString;
}

export interface SearchLog {
  id: ID;
  user_id: ID | null;
  query: string;
  results_count: number;
  created_at: ISODateString;
}

export interface ProductClick {
  id: ID;
  product_id: ID;
  user_id: ID | null;
  source: string; // search / banner / category / ...
  created_at: ISODateString;
}

// ─────────────────────────────────────────────
// جداول داخلی پیاده‌سازی (توکن‌ها و لاگ‌ها)
// ─────────────────────────────────────────────

export interface PersonalAccessToken {
  id: ID;
  user_id: ID;
  token: string;
  name: string;
  abilities: string[];
  last_used_at: ISODateString | null;
  expires_at: ISODateString;
  revoked_at: ISODateString | null;
  created_at: ISODateString;
}

export interface ActivityLog {
  id: ID;
  user_id: ID | null;
  action: string;
  subject_type: string | null;
  subject_id: ID | null;
  description: string | null;
  created_at: ISODateString;
}

export interface StockAlert {
  id: ID;
  user_id: ID | null;
  phone: string | null;
  product_variant_id: ID;
  created_at: ISODateString;
}

// ─────────────────────────────────────────────
// پاسخ‌های استاندارد API (سبک Laravel Resources)
// ─────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
