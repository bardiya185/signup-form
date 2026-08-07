/**
 * ─── لایه دیتابیس ───
 * داده‌ها روی دیتابیس واقعی SQLite (data/ginankala.sqlite) ماندگار می‌شوند؛
 * بارگذاری/ذخیره در ./sqlite.ts انجام می‌شود. ساختار جداول دقیقاً معادل
 * جداول لاراول است؛ در نسخه پروداکشن همین داده‌ها به MySQL لاراول منتقل می‌شود.
 */
import type * as D from '@/types/domain';
import { loadFromSqlite, persistToSqlite } from './sqlite';
import { attributes, attributeValues, colors, guarantees, sizes } from './data/lookups';
import { cities, provinces } from './data/geo';
import { brands, categories } from './data/catalog';
import { addresses, sellers, users, wallets } from './data/users-sellers';
import {
  priceHistory, productAttributes, productImages, products, productVariants,
} from './data/products';
import { productQuestions, reviews } from './data/reviews-questions';
import { coupons, shippingMethods, specialOffers } from './data/commerce';
import { banners, faqs, menus, pages, sliders } from './data/cms';
import {
  blogPosts, compareListItems, compareLists, notifications, orderItems,
  orderStatusHistory, orders, payments, sellerSettlements, settings,
  ticketMessages, tickets, walletTransactions, wishlists,
} from './data/history-blog';

export interface Database {
  users: D.User[];
  addresses: D.Address[];
  provinces: D.Province[];
  cities: D.City[];
  otp_codes: D.OtpCode[];
  categories: D.Category[];
  brands: D.Brand[];
  products: D.Product[];
  product_variants: D.ProductVariant[];
  product_images: D.ProductImage[];
  product_videos: D.ProductVideo[];
  attributes: D.Attribute[];
  attribute_values: D.AttributeValue[];
  product_attributes: D.ProductAttribute[];
  colors: D.Color[];
  sizes: D.Size[];
  guarantees: D.Guarantee[];
  product_questions: D.ProductQuestion[];
  product_price_history: D.ProductPriceHistory[];
  reviews: D.Review[];
  review_reactions: D.ReviewReaction[];
  review_images: D.ReviewImage[];
  carts: D.Cart[];
  cart_items: D.CartItem[];
  orders: D.Order[];
  order_items: D.OrderItem[];
  order_status_history: D.OrderStatusHistory[];
  shipping_methods: D.ShippingMethod[];
  payments: D.Payment[];
  wallets: D.Wallet[];
  wallet_transactions: D.WalletTransaction[];
  coupons: D.Coupon[];
  special_offers: D.SpecialOffer[];
  wishlists: D.Wishlist[];
  compare_lists: D.CompareList[];
  compare_list_items: D.CompareListItem[];
  notifications: D.AppNotification[];
  push_subscriptions: D.PushSubscription[];
  pages: D.Page[];
  banners: D.Banner[];
  sliders: D.Slider[];
  menus: D.Menu[];
  blog_posts: D.BlogPost[];
  faqs: D.Faq[];
  sellers: D.Seller[];
  seller_settlements: D.SellerSettlement[];
  tickets: D.Ticket[];
  ticket_messages: D.TicketMessage[];
  page_views: D.PageView[];
  search_logs: D.SearchLog[];
  product_clicks: D.ProductClick[];
  // جداول داخلی پیاده‌سازی
  personal_access_tokens: D.PersonalAccessToken[];
  activity_logs: D.ActivityLog[];
  stock_alerts: D.StockAlert[];
  stock_movements: D.StockMovement[];
  settings: Record<string, string>;
}

function createDatabase(): Database {
  return {
    users, addresses, provinces, cities,
    otp_codes: [],
    categories, brands, products,
    product_variants: productVariants,
    product_images: productImages,
    product_videos: [],
    attributes, attribute_values: attributeValues,
    product_attributes: productAttributes,
    colors, sizes, guarantees, product_questions: productQuestions,
    product_price_history: priceHistory,
    reviews,
    review_reactions: [], review_images: [],
    carts: [], cart_items: [],
    orders, order_items: orderItems, order_status_history: orderStatusHistory,
    shipping_methods: shippingMethods,
    payments, wallets,
    wallet_transactions: walletTransactions,
    coupons, special_offers: specialOffers,
    wishlists, compare_lists: compareLists, compare_list_items: compareListItems,
    notifications, push_subscriptions: [],
    pages, banners, sliders, menus,
    blog_posts: blogPosts, faqs,
    sellers, seller_settlements: sellerSettlements,
    tickets, ticket_messages: ticketMessages,
    page_views: [], search_logs: [], product_clicks: [],
    personal_access_tokens: [],
    activity_logs: [
      { id: 1, user_id: 1, action: 'system.seed', subject_type: null, subject_id: null, description: 'داده‌های اولیه سیستم بارگذاری شد', created_at: '2026-01-01T00:00:00Z' },
    ],
    stock_alerts: [
      { id: 1, user_id: 2, phone: null, product_variant_id: 2, created_at: '2026-08-01T00:00:00Z' },
    ],
    stock_movements: [],
    settings,
  };
}

// نسخه اسکیمای سید — با هر تغییر ساختاری، کلید عوض می‌شود تا دیتابیس بازسازی شود
const DB_GLOBAL_KEY = '__GNK_DB_V4__';

function bootstrap(): Database {
  const template = createDatabase();
  const loaded = loadFromSqlite(template);
  if (loaded) return loaded;
  // اولین اجرا: سید کامل داده‌ها روی دیتابیس واقعی ذخیره می‌شود
  persistToSqlite(template);
  return template;
}

const globalForDb = globalThis as unknown as Record<string, Database | undefined>;
export const db: Database = (globalForDb[DB_GLOBAL_KEY] ??= bootstrap());

/** فلاش وضعیت فعلی دیتابیس روی دیسک (بعد از هر درخواست موفق API صدا زده می‌شود) */
export function persistDb(): void {
  persistToSqlite(db);
}

/** تولید شناسه بعدی یک جدول (معادل auto-increment) */
export function nextId(rows: Array<{ id: number }>): number {
  return rows.length ? Math.max(...rows.map((r) => r.id)) + 1 : 1;
}
