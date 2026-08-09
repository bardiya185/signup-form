'use client';
/**
 * ─── هوک‌های React Query پنل‌های مدیریت / فروشنده / انبار ───
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http, firstError, type Envelope, type PaginatedEnv } from '@/lib/http';
import { toast } from '@/stores/ui.store';
import { useAuthStore } from '@/stores/auth.store';
import type {
  ActivityLogRow, AdminBannerRow, AdminBrandRow, AdminCategoryRow, AdminCouponRow,
  AdminDashboardDto, AdminOfferRow, AdminPaymentRow, AdminProductRow, AdminReviewRow,
  AdminSellerRow, AdminUserRow, ProductsReportDto, RevenueReportDto, SalesReportDto,
  SellerAnalyticsDto, SellerDashboardDto, SellerOrderRow, SellerProductRow, SettlementRow,
  ShipmentRow, StockMovementRow, UsersReportDto, WarehouseDashboardDto, WarehouseVariantRow,
} from '@/types/admin';
import type { OrderDto, TicketDto } from '@/types/account';

const onErr = (e: unknown) => toast.error(firstError(e));
const useRole = () => useAuthStore((s) => s.user?.role);
const isAdminRole = (r?: string) => r === 'admin' || r === 'super_admin';
const canWarehouse = (r?: string) => isAdminRole(r) || r === 'warehouse';

// ════════ داشبورد ادمین ════════
export const useAdminDashboard = () => {
  const role = useRole();
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => http.get<Envelope<AdminDashboardDto>>('/admin/dashboard'),
    enabled: isAdminRole(role),
    refetchInterval: 60_000,
  });
};

// ════════ محصولات ادمین ════════
export const useAdminProducts = (filters: { q?: string; status?: string; category?: string; page?: number }) => {
  const role = useRole();
  return useQuery({
    queryKey: ['admin', 'products', filters],
    queryFn: () =>
      http.get<PaginatedEnv<AdminProductRow>>('/admin/products', {
        q: filters.q, status: filters.status, category: filters.category,
        page: filters.page ?? 1, per_page: 15,
      } as Record<string, string | number>),
    enabled: isAdminRole(role),
  });
};

export const useAdminProductMutations = () => {
  const qc = useQueryClient();
  const done = (msg: string) => () => {
    toast.success(msg);
    void qc.invalidateQueries({ queryKey: ['admin'] });
  };
  const create = useMutation({
    mutationFn: (input: Record<string, unknown>) => http.post('/admin/products', input),
    onSuccess: done('محصول جدید ایجاد شد'), onError: onErr,
  });
  const update = useMutation({
    mutationFn: (input: { id: number } & Record<string, unknown>) => http.put(`/admin/products/${input.id}`, input),
    onSuccess: done('محصول به‌روزرسانی شد'), onError: onErr,
  });
  const remove = useMutation({
    mutationFn: (id: number) => http.del(`/admin/products/${id}`),
    onSuccess: done('محصول حذف شد'), onError: onErr,
  });
  return { create, update, remove };
};

// ════════ سفارش‌های ادمین ════════
export const useAdminOrders = (filters: { status?: string; q?: string; page?: number }) => {
  const role = useRole();
  return useQuery({
    queryKey: ['admin', 'orders', filters],
    queryFn: () =>
      http.get<PaginatedEnv<OrderDto>>('/admin/orders', {
        status: filters.status, q: filters.q, page: filters.page ?? 1, per_page: 15,
      } as Record<string, string | number>),
    enabled: isAdminRole(role),
  });
};

export const useAdminOrderDetail = (id: string | number) => {
  const role = useRole();
  return useQuery({
    queryKey: ['admin', 'order', String(id)],
    queryFn: () => http.get<Envelope<OrderDto & { payments: AdminPaymentRow[] }>>(`/admin/orders/${id}`),
    enabled: isAdminRole(role) && !!id,
  });
};

export const useAdminUpdateOrderStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: number; status: string; description?: string }) =>
      http.put(`/admin/orders/${input.id}`, { status: input.status, description: input.description }),
    onSuccess: () => {
      toast.success('وضعیت سفارش به‌روزرسانی شد');
      void qc.invalidateQueries({ queryKey: ['admin'] });
    },
    onError: onErr,
  });
};

// ════════ کاربران ════════
export const useAdminUsers = (filters: { q?: string; role?: string; status?: string; page?: number }) => {
  const role = useRole();
  return useQuery({
    queryKey: ['admin', 'users', filters],
    queryFn: () =>
      http.get<PaginatedEnv<AdminUserRow>>('/admin/users', {
        q: filters.q, role: filters.role, status: filters.status, page: filters.page ?? 1, per_page: 15,
      } as Record<string, string | number>),
    enabled: isAdminRole(role),
  });
};

export const useAdminUpdateUserStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: number; status: string }) => http.put(`/admin/users/${input.id}`, { status: input.status }),
    onSuccess: () => {
      toast.success('وضعیت کاربر تغییر کرد');
      void qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: onErr,
  });
};

// ════════ فروشندگان (ادمین) ════════
export const useAdminSellers = () => {
  const role = useRole();
  return useQuery({
    queryKey: ['admin', 'sellers'],
    queryFn: () => http.get<Envelope<AdminSellerRow[]>>('/admin/sellers'),
    enabled: isAdminRole(role),
  });
};

export const useAdminSetSellerStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: number; status: string; reason?: string }) =>
      http.put(`/admin/sellers/${input.id}`, { status: input.status, reason: input.reason }),
    onSuccess: () => {
      toast.success('وضعیت فروشنده تغییر کرد');
      void qc.invalidateQueries({ queryKey: ['admin', 'sellers'] });
    },
    onError: onErr,
  });
};

// ════════ کوپن‌ها ════════
export const useAdminCoupons = () => {
  const role = useRole();
  return useQuery({
    queryKey: ['admin', 'coupons'],
    queryFn: () => http.get<Envelope<AdminCouponRow[]>>('/admin/coupons'),
    enabled: isAdminRole(role),
  });
};

export const useAdminCouponMutations = () => {
  const qc = useQueryClient();
  const invalidate = () => void qc.invalidateQueries({ queryKey: ['admin', 'coupons'] });
  return {
    create: useMutation({
      mutationFn: (input: Record<string, unknown>) => http.post('/admin/coupons', input),
      onSuccess: () => { toast.success('کوپن ایجاد شد'); invalidate(); }, onError: onErr,
    }),
    update: useMutation({
      mutationFn: (input: { id: number } & Record<string, unknown>) => http.put(`/admin/coupons/${input.id}`, input),
      onSuccess: () => { toast.success('کوپن به‌روزرسانی شد'); invalidate(); }, onError: onErr,
    }),
    remove: useMutation({
      mutationFn: (id: number) => http.del(`/admin/coupons/${id}`),
      onSuccess: () => { toast.success('کوپن حذف شد'); invalidate(); }, onError: onErr,
    }),
  };
};

// ════════ پیشنهادهای ویژه ════════
export const useAdminOffers = () => {
  const role = useRole();
  return useQuery({
    queryKey: ['admin', 'offers'],
    queryFn: () => http.get<Envelope<AdminOfferRow[]>>('/admin/offers'),
    enabled: isAdminRole(role),
  });
};

export const useAdminOfferMutations = () => {
  const qc = useQueryClient();
  const invalidate = () => void qc.invalidateQueries({ queryKey: ['admin', 'offers'] });
  return {
    create: useMutation({
      mutationFn: (input: Record<string, unknown>) => http.post('/admin/offers', input),
      onSuccess: () => { toast.success('پیشنهاد ویژه ایجاد شد'); invalidate(); }, onError: onErr,
    }),
    toggle: useMutation({
      mutationFn: (input: { id: number; is_active: boolean }) => http.put(`/admin/offers/${input.id}`, { is_active: input.is_active }),
      onSuccess: () => { toast.success('وضعیت پیشنهاد تغییر کرد'); invalidate(); }, onError: onErr,
    }),
    remove: useMutation({
      mutationFn: (id: number) => http.del(`/admin/offers/${id}`),
      onSuccess: () => { toast.success('پیشنهاد حذف شد'); invalidate(); }, onError: onErr,
    }),
  };
};

// ════════ دیدگاه‌ها ════════
export const useAdminReviews = (status: string | undefined, page: number) => {
  const role = useRole();
  return useQuery({
    queryKey: ['admin', 'reviews', status, page],
    queryFn: () => http.get<PaginatedEnv<AdminReviewRow>>('/admin/reviews', { status, page, per_page: 15 } as Record<string, string | number>),
    enabled: isAdminRole(role),
  });
};

export const useAdminModerateReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: number; action: 'approve' | 'reject' | 'delete' }) =>
      input.action === 'delete' ? http.del(`/admin/reviews/${input.id}`) : http.put(`/admin/reviews/${input.id}`, { status: input.action === 'approve' ? 'approved' : 'rejected' }),
    onSuccess: () => {
      toast.success('دیدگاه به‌روزرسانی شد');
      void qc.invalidateQueries({ queryKey: ['admin', 'reviews'] });
    },
    onError: onErr,
  });
};

// ════════ دسته‌بندی‌ها و برندها ════════
export const useAdminCategories = () => {
  const role = useRole();
  return useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => http.get<Envelope<AdminCategoryRow[]>>('/admin/categories'),
    enabled: isAdminRole(role),
  });
};

export const useAdminCategoryMutations = () => {
  const qc = useQueryClient();
  const invalidate = () => void qc.invalidateQueries({ queryKey: ['admin', 'categories'] });
  return {
    create: useMutation({
      mutationFn: (input: Record<string, unknown>) => http.post('/admin/categories', input),
      onSuccess: () => { toast.success('دسته ایجاد شد'); invalidate(); }, onError: onErr,
    }),
    update: useMutation({
      mutationFn: (input: { id: number } & Record<string, unknown>) => http.put(`/admin/categories/${input.id}`, input),
      onSuccess: () => { toast.success('دسته به‌روزرسانی شد'); invalidate(); }, onError: onErr,
    }),
    remove: useMutation({
      mutationFn: (id: number) => http.del(`/admin/categories/${id}`),
      onSuccess: () => { toast.success('دسته حذف شد'); invalidate(); }, onError: onErr,
    }),
  };
};

export const useAdminBrands = () => {
  const role = useRole();
  return useQuery({
    queryKey: ['admin', 'brands'],
    queryFn: () => http.get<Envelope<AdminBrandRow[]>>('/admin/brands'),
    enabled: isAdminRole(role),
  });
};

export const useAdminBrandMutations = () => {
  const qc = useQueryClient();
  const invalidate = () => void qc.invalidateQueries({ queryKey: ['admin', 'brands'] });
  return {
    create: useMutation({
      mutationFn: (input: Record<string, unknown>) => http.post('/admin/brands', input),
      onSuccess: () => { toast.success('برند ایجاد شد'); invalidate(); }, onError: onErr,
    }),
    update: useMutation({
      mutationFn: (input: { id: number } & Record<string, unknown>) => http.put(`/admin/brands/${input.id}`, input),
      onSuccess: () => { toast.success('برند به‌روزرسانی شد'); invalidate(); }, onError: onErr,
    }),
    remove: useMutation({
      mutationFn: (id: number) => http.del(`/admin/brands/${id}`),
      onSuccess: () => { toast.success('برند حذف شد'); invalidate(); }, onError: onErr,
    }),
  };
};

// ════════ بنرها ════════
export const useAdminBanners = () => {
  const role = useRole();
  return useQuery({
    queryKey: ['admin', 'banners'],
    queryFn: () => http.get<Envelope<AdminBannerRow[]>>('/admin/banners'),
    enabled: isAdminRole(role),
  });
};

export const useAdminBannerMutations = () => {
  const qc = useQueryClient();
  const invalidate = () => void qc.invalidateQueries({ queryKey: ['admin', 'banners'] });
  return {
    create: useMutation({
      mutationFn: (input: Record<string, unknown>) => http.post('/admin/banners', input),
      onSuccess: () => { toast.success('بنر ایجاد شد'); invalidate(); }, onError: onErr,
    }),
    update: useMutation({
      mutationFn: (input: { id: number } & Record<string, unknown>) => http.put(`/admin/banners/${input.id}`, input),
      onSuccess: () => { toast.success('بنر به‌روزرسانی شد'); invalidate(); }, onError: onErr,
    }),
    remove: useMutation({
      mutationFn: (id: number) => http.del(`/admin/banners/${id}`),
      onSuccess: () => { toast.success('بنر حذف شد'); invalidate(); }, onError: onErr,
    }),
  };
};

// ════════ پرداخت‌ها / تیکت‌ها / تنظیمات / لاگ / گزارشات ════════
export const useAdminPayments = (filters: { status?: string; method?: string; page?: number }) => {
  const role = useRole();
  return useQuery({
    queryKey: ['admin', 'payments', filters],
    queryFn: () =>
      http.get<PaginatedEnv<AdminPaymentRow>>('/admin/payments', {
        status: filters.status, method: filters.method, page: filters.page ?? 1, per_page: 15,
      } as Record<string, string | number>),
    enabled: isAdminRole(role),
  });
};

export const useAdminTickets = (status?: string, page = 1) => {
  const role = useRole();
  return useQuery({
    queryKey: ['admin', 'tickets', status, page],
    queryFn: () => http.get<PaginatedEnv<TicketRow>>(`/admin/tickets`, { status, page } as Record<string, string | number>),
    enabled: isAdminRole(role),
  });
};

export interface TicketRow {
  id: number; subject: string; department: string; departmentFa: string;
  priority: string; priorityFa: string; status: string; statusFa: string;
  orderNumber: string | null; requesterName: string; lastMessageAt: string; createdAt: string;
}

export const useAdminTicketDetail = (id: string | number) => {
  const role = useRole();
  return useQuery({
    queryKey: ['admin', 'ticket', String(id)],
    queryFn: () => http.get<Envelope<TicketDto>>(`/admin/tickets/${id}`),
    enabled: isAdminRole(role) && !!id,
  });
};

export const useAdminTicketMutations = (id: string | number) => {
  const qc = useQueryClient();
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ['admin', 'ticket', String(id)] });
    void qc.invalidateQueries({ queryKey: ['admin', 'tickets'] });
  };
  return {
    reply: useMutation({
      mutationFn: (body: string) => http.post(`/admin/tickets/${id}/messages`, { body }),
      onSuccess: () => { toast.success('پاسخ ارسال شد'); invalidate(); }, onError: onErr,
    }),
    close: useMutation({
      mutationFn: () => http.put(`/admin/tickets/${id}`, {}),
      onSuccess: () => { toast.success('تیکت بسته شد'); invalidate(); }, onError: onErr,
    }),
  };
};

export const useAdminSettings = () => {
  const role = useRole();
  return useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: () => http.get<Envelope<Record<string, string>>>('/admin/settings'),
    enabled: isAdminRole(role),
  });
};

export const useAdminUpdateSettings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Record<string, string>) => http.post('/admin/settings', patch),
    onSuccess: () => {
      toast.success('تنظیمات ذخیره شد');
      void qc.invalidateQueries({ queryKey: ['admin', 'settings'] });
    },
    onError: onErr,
  });
};

export const useAdminLogs = (page: number) => {
  const role = useRole();
  return useQuery({
    queryKey: ['admin', 'logs', page],
    queryFn: () => http.get<PaginatedEnv<ActivityLogRow>>('/admin/logs', { page, per_page: 30 }),
    enabled: isAdminRole(role),
  });
};

export const useAdminReport = (kind: 'sales' | 'products' | 'users' | 'revenue') => {
  const role = useRole();
  return useQuery({
    queryKey: ['admin', 'reports', kind],
    queryFn: () =>
      http.get<Envelope<SalesReportDto & ProductsReportDto & UsersReportDto & RevenueReportDto>>(
        `/admin/reports/${kind}`,
      ),
    enabled: isAdminRole(role),
  });
};

// ════════ پنل فروشنده ════════
const isSellerRole = (r?: string) => r === 'seller' || isAdminRole(r);

export const useSellerDashboard = () => {
  const role = useRole();
  return useQuery({
    queryKey: ['seller', 'dashboard'],
    queryFn: () => http.get<Envelope<SellerDashboardDto>>('/seller/dashboard'),
    enabled: isSellerRole(role),
  });
};

export const useSellerProducts = (page = 1) => {
  const role = useRole();
  return useQuery({
    queryKey: ['seller', 'products', page],
    queryFn: () => http.get<PaginatedEnv<SellerProductRow>>('/seller/products', { page, per_page: 12 }),
    enabled: isSellerRole(role),
  });
};

export const useSellerProductMutations = () => {
  const qc = useQueryClient();
  const invalidate = () => void qc.invalidateQueries({ queryKey: ['seller'] });
  return {
    create: useMutation({
      mutationFn: (input: Record<string, unknown>) => http.post('/seller/products', input),
      onSuccess: () => { toast.success('کالای شما ثبت و برای بررسی ارسال شد'); invalidate(); }, onError: onErr,
    }),
    update: useMutation({
      mutationFn: (input: { id: number } & Record<string, unknown>) => http.put(`/seller/products/${input.id}`, input),
      onSuccess: () => { toast.success('کالا به‌روزرسانی شد'); invalidate(); }, onError: onErr,
    }),
  };
};

export const useSellerOrders = () => {
  const role = useRole();
  return useQuery({
    queryKey: ['seller', 'orders'],
    queryFn: () => http.get<Envelope<SellerOrderRow[]>>('/seller/orders'),
    enabled: isSellerRole(role),
  });
};

export const useSellerSettlements = () => {
  const role = useRole();
  return useQuery({
    queryKey: ['seller', 'settlements'],
    queryFn: () => http.get<Envelope<SettlementRow[]>>('/seller/settlements'),
    enabled: isSellerRole(role),
  });
};

export const useSellerAnalytics = () => {
  const role = useRole();
  return useQuery({
    queryKey: ['seller', 'analytics'],
    queryFn: () => http.get<Envelope<SellerAnalyticsDto>>('/seller/analytics'),
    enabled: isSellerRole(role),
  });
};

// ════════ پنل انبار ════════
export const useWarehouseDashboard = () => {
  const role = useRole();
  return useQuery({
    queryKey: ['warehouse', 'dashboard'],
    queryFn: () => http.get<Envelope<WarehouseDashboardDto>>('/warehouse/dashboard'),
    enabled: canWarehouse(role),
    refetchInterval: 60_000,
  });
};

export const useWarehouseInventory = (filters: { q?: string; state?: string; page?: number }) => {
  const role = useRole();
  return useQuery({
    queryKey: ['warehouse', 'inventory', filters],
    queryFn: () =>
      http.get<PaginatedEnv<WarehouseVariantRow>>('/warehouse/inventory', {
        q: filters.q, state: filters.state, page: filters.page ?? 1, per_page: 15,
      } as Record<string, string | number>),
    enabled: canWarehouse(role),
  });
};

export const useAdjustStock = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: number; stock: number; reason?: string }) =>
      http.put(`/warehouse/inventory/${input.id}`, { stock: input.stock, reason: input.reason }),
    onSuccess: () => {
      toast.success('موجودی به‌روزرسانی و در گردش انبار ثبت شد');
      void qc.invalidateQueries({ queryKey: ['warehouse'] });
    },
    onError: onErr,
  });
};

export const useWarehouseShipments = (state: 'ready' | 'shipped', page = 1) => {
  const role = useRole();
  return useQuery({
    queryKey: ['warehouse', 'shipments', state, page],
    queryFn: () => http.get<PaginatedEnv<ShipmentRow>>('/warehouse/shipments', { state, page }),
    enabled: canWarehouse(role),
  });
};

export const useShipOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => http.put(`/warehouse/shipments/${id}/ship`),
    onSuccess: () => {
      toast.success('سفارش از انبار خارج شد 📦');
      void qc.invalidateQueries({ queryKey: ['warehouse'] });
    },
    onError: onErr,
  });
};

export const useWarehouseMovements = (page = 1) => {
  const role = useRole();
  return useQuery({
    queryKey: ['warehouse', 'movements', page],
    queryFn: () => http.get<PaginatedEnv<StockMovementRow>>('/warehouse/movements', { page }),
    enabled: canWarehouse(role),
  });
};
