/**
 * ─── DTO های پنل‌های مدیریت / فروشنده / انبار (آینه خروجی API) ───
 */

// ════════ ادمین ════════
export interface AdminDashboardDto {
  cards: {
    totalRevenue: number; totalOrders: number; todayOrders: number;
    totalUsers: number; totalProducts: number; totalSellers: number;
    todayRevenue: number; averageOrderValue: number;
  };
  ordersByStatus: Record<string, number>;
  salesChart: { key: string; label: string; revenue: number; orders: number }[];
  topProducts: { productId: number; title: string; image: string | null; quantity: number; revenue: number }[];
  lowStock: { variantId: number; sku: string; title: string; stock: number }[];
  pending: { products: number; reviews: number; sellers: number; openTickets: number };
  recentOrders: {
    id: number; orderNumber: string; buyer: string; total: number;
    status: string; statusFa: string; createdAt: string;
  }[];
}

export interface AdminProductRow {
  id: number; title: string; slug: string; sku: string; status: string;
  isFeatured: boolean; image: string | null; categoryTitle: string | null;
  brandTitle: string | null; sellerTitle: string | null;
  price: number; stock: number; viewCount: number; createdAt: string;
}

export interface AdminUserRow {
  id: number; firstName: string; lastName: string; fullName: string;
  email: string | null; phone: string; role: string; status: string; statusFa: string;
  ordersCount: number; totalSpent: number; createdAt: string;
}

export interface AdminSellerRow {
  id: number; shopName: string; slug: string; logo: string | null;
  description: string | null; phone: string; email: string;
  nationalId: string; commissionRate: number; status: string; statusFa: string;
  rating: number; ownerName: string; createdAt: string; productsCount: number;
}

export interface AdminCouponRow {
  id: number; code: string; type: 'percentage' | 'fixed'; typeFa: string;
  value: number; maxDiscount: number | null; minOrderAmount: number | null;
  usageLimit: number | null; usedCount: number; perUserLimit: number | null;
  startsAt: string | null; expiresAt: string | null; isActive: boolean;
  applicableCategories: number[]; applicableProducts: number[];
}

export interface AdminOfferRow {
  id: number; title: string; type: string;
  product_variant_id: number; discount_percentage: number; discount_price: number;
  stock: number; sold_count: number;
  starts_at: string; expires_at: string; is_active: boolean;
  productTitle: string; productId: number | null; variantSku: string;
}

export interface AdminBannerRow {
  id: number; title: string; image: string; link: string | null;
  position: string; sort_order: number; is_active: boolean;
  starts_at: string | null; expires_at: string | null;
}

export interface AdminReviewRow {
  id: number; title: string; body: string; rating: number; status: string;
  isBuyer: boolean; likesCount: number; dislikesCount: number;
  productId: number; productTitle: string; authorName: string; createdAt: string;
}

export interface AdminCategoryRow {
  id: number; title: string; slug: string; parent_id: number | null;
  icon: string | null; image: string | null; sort_order: number; is_active: boolean;
  productsCount?: number;
}

export interface AdminBrandRow {
  id: number; title: string; slug: string; logo: string | null; is_active: boolean;
}

export interface AdminPaymentRow {
  id: number; amount: number; method: string; methodFa: string;
  status: string; statusFa: string; transactionId: string; refNumber: string | null;
  orderNumber: string | null; isWalletCharge: boolean;
  paidAt: string | null; createdAt: string; buyerName?: string;
}

export interface ActivityLogRow {
  id: number; action: string; subjectType: string | null; subjectId: number | null;
  description: string | null; actorName: string; createdAt: string;
}

export interface SalesReportDto {
  daily: { date: string; orders: number; revenue: number }[];
  totalRevenue: number; totalOrders: number;
}

export interface ProductsReportDto {
  byRevenue: { id: number; title: string; status: string; viewCount: number; stock: number; unitsSold: number; revenue: number }[];
  topViewed: { id: number; title: string; status: string; viewCount: number; stock: number; unitsSold: number; revenue: number }[];
}

export interface UsersReportDto {
  registrations: { key: string; label: string; count: number }[];
  topBuyers: { id: number; name: string; ordersCount: number; totalSpent: number }[];
  byRole: Record<string, number>;
}

export interface RevenueReportDto {
  byMethod: { method: string; methodFa: string; total: number; count: number }[];
  monthly: { key: string; label: string; revenue: number }[];
  refunded: number;
  walletDeposits: number;
}

// ════════ فروشنده ════════
export interface SellerInfoDto {
  id: number; shopName: string; slug: string; logo: string | null;
  description: string | null; phone: string; email: string; nationalId: string;
  commissionRate: number; status: string; statusFa: string; rating: number;
  ownerName: string; createdAt: string;
}

export interface SellerDashboardDto {
  seller: SellerInfoDto;
  stats: {
    productsTotal: number; productsActive: number; productsPending: number;
    unitsSold: number; ordersCount: number; totalRevenue: number;
    pendingSettlement: number; rating: number;
  };
  recentSales: {
    orderNumber: string; itemTitle: string; quantity: number;
    total: number; buyer: string; createdAt: string;
  }[];
}

/** ردیف محصول فروشنده = کارت محصول + وضعیت */
export interface SellerProductRow {
  id: number; slug: string; title: string; image: string;
  price: number; effectivePrice: number; discountPercent: number;
  rating: number; reviewCount: number; stock: number;
  status: string; createdAt?: string;
}

/** اطلاعات تنوع ذخیره‌شده روی آیتم سفارش */
export interface VariantInfoDto { sku?: string; color?: string | null; size?: string | null; guarantee?: string | null }

export interface SellerOrderRow {
  id: number; orderNumber: string; orderStatus: string;
  itemTitle: string; variantInfo: VariantInfoDto | null; quantity: number;
  unitPrice: number; total: number; buyer: string; createdAt: string;
}

export interface SettlementRow {
  id: number; amount: number; status: string; statusFa: string;
  paidAt: string | null; reference: string | null; createdAt: string;
}

export interface SellerAnalyticsDto {
  monthly: { key: string; label: string; revenue: number; units: number }[];
  topProducts: { title: string; revenue: number; units: number }[];
  commissionRate: number;
  netRevenue: number;
}

// ════════ انبار ════════
export interface WarehouseVariantRow {
  variantId: number; sku: string; productId: number; productTitle: string;
  productSlug: string; image: string | null;
  color: import('./domain').Color | null;
  guarantee: string | null;
  price: number; salePrice: number | null; stock: number; isActive: boolean;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface WarehouseDashboardDto {
  stats: {
    totalVariants: number; totalStockUnits: number; stockValue: number;
    lowStockCount: number; outOfStockCount: number; pendingShipments: number;
    shippedThisWeek: number; movementsToday: number;
  };
  lowStock: WarehouseVariantRow[];
  readyShipments: {
    id: number; orderNumber: string; buyer: string; itemsCount: number; total: number; createdAt: string;
  }[];
  recentMovements: StockMovementRow[];
}

export interface StockMovementRow {
  id: number; sku: string; productTitle: string;
  oldStock: number; newStock: number; delta: number;
  reason: string; changedBy: string; createdAt: string;
}

export interface ShipmentRow {
  id: number; orderNumber: string; status: string; statusFa: string;
  buyer: string; destination: string; itemsCount: number;
  items: { id: number; title: string; variantInfo: VariantInfoDto | null; quantity: number }[];
  total: number; createdAt: string; shippedAt: string | null;
}
