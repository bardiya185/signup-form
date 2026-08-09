'use client';
/**
 * ─── هوک‌های حساب کاربری، سفارش، پرداخت، کیف پول، اعلان و تیکت ───
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http, firstError, type Envelope, type PaginatedEnv } from '@/lib/http';
import { toast } from '@/stores/ui.store';
import { useAuthStore, type AuthUser } from '@/stores/auth.store';
import type {
  AddressDto, CheckoutResult, NotificationDto, OrderDto, OrderStatus,
  PaymentDto, ProvinceDto, ShippingMethodDto, TicketDto, VerifyPaymentResult,
  WalletOverviewDto, WalletTransactionDto,
} from '@/types/account';
import type { AddressInput, ProfileInput, ChangePasswordInput } from '@/lib/validators';

const onErr = (e: unknown) => toast.error(firstError(e));

// ════════ آدرس‌ها ════════
export const useAddresses = () => {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: ['addresses'],
    queryFn: () => http.get<Envelope<AddressDto[]>>('/addresses'),
    enabled: !!user,
  });
};

const useAddressMutation = <TInput,>(fn: (input: TInput) => Promise<unknown>, msg: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      toast.success(msg);
      void qc.invalidateQueries({ queryKey: ['addresses'] });
    },
    onError: onErr,
  });
};

export const useCreateAddress = () =>
  useAddressMutation((input: AddressInput) => http.post('/addresses', input), 'آدرس جدید ثبت شد');
export const useUpdateAddress = () =>
  useAddressMutation((input: { id: number } & Partial<AddressInput>) => http.put(`/addresses/${input.id}`, input), 'آدرس به‌روزرسانی شد');
export const useDeleteAddress = () =>
  useAddressMutation((id: number) => http.del(`/addresses/${id}`), 'آدرس حذف شد');
export const useSetDefaultAddress = () =>
  useAddressMutation((id: number) => http.put(`/addresses/${id}/set-default`), 'آدرس پیش‌فرض تغییر کرد');

// ════════ جغرافیا و ارسال ════════
export const useProvinces = () =>
  useQuery({
    queryKey: ['provinces'],
    queryFn: () => http.get<Envelope<ProvinceDto[]>>('/provinces'),
    staleTime: 600_000,
  });

export const useCities = (provinceId?: number) =>
  useQuery({
    queryKey: ['cities', provinceId],
    queryFn: () => http.get<Envelope<ProvinceDto[]>>(`/provinces/${provinceId}/cities`),
    enabled: !!provinceId,
    staleTime: 600_000,
  });

export const useShippingMethods = () =>
  useQuery({
    queryKey: ['shipping-methods'],
    queryFn: () => http.get<Envelope<ShippingMethodDto[]>>('/shipping-methods'),
    staleTime: 300_000,
  });

// ════════ سفارش‌ها ════════
export const useOrders = (status?: OrderStatus, page = 1) => {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: ['orders', status ?? 'all', page],
    queryFn: () => http.get<PaginatedEnv<OrderDto>>('/orders', { status, page, per_page: 10 } as Record<string, string | number>),
    enabled: !!user,
  });
};

export const useOrder = (orderNumber: string) => {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: ['order', orderNumber],
    queryFn: () => http.get<Envelope<OrderDto>>(`/orders/${orderNumber}`),
    enabled: !!user && !!orderNumber,
  });
};

const useOrderAction = (verb: 'cancel' | 'return', msg: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { orderNumber: string; reason: string }) =>
      http.post<Envelope<OrderDto>>(`/orders/${input.orderNumber}/${verb}`, { reason: input.reason }),
    onSuccess: (res) => {
      toast.success(msg);
      qc.setQueryData(['order', res.data.orderNumber], res);
      void qc.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: onErr,
  });
};
export const useCancelOrder = () => useOrderAction('cancel', 'سفارش با موفقیت لغو شد');
export const useReturnOrder = () => useOrderAction('return', 'درخواست مرجوعی ثبت شد');

// ════════ تسویه حساب و پرداخت ════════
export const useCheckout = () =>
  useMutation({
    mutationFn: (input: { address_id: number; payment_method: string; shipping_method_id?: number; notes?: string }) =>
      http.post<Envelope<CheckoutResult>>('/orders/checkout', input),
    onError: onErr,
  });

export const useCreatePayment = () =>
  useMutation({
    mutationFn: (input: { order_number: string; gateway: 'zarinpal' | 'mellat' | 'saman' }) =>
      http.post<Envelope<{ payment: PaymentDto; payUrl: string; expiresIn: number }>>('/payments/create', input),
    onError: onErr,
  });

export const useVerifyPayment = (authority?: string | null, status?: string | null) =>
  useQuery({
    queryKey: ['payment-verify', authority, status],
    queryFn: () =>
      http.get<Envelope<VerifyPaymentResult>>('/payments/verify', { Authority: authority!, Status: status! }),
    enabled: !!authority && !!status,
    retry: false,
    staleTime: Infinity,
  });

// ════════ کیف پول ════════
export const useWallet = () => {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: ['wallet'],
    queryFn: () => http.get<Envelope<WalletOverviewDto>>('/wallet'),
    enabled: !!user,
  });
};

export const useWalletTransactions = (page = 1) => {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: ['wallet-transactions', page],
    queryFn: () => http.get<PaginatedEnv<WalletTransactionDto>>('/wallet/transactions', { page, per_page: 15 }),
    enabled: !!user,
  });
};

export const useWalletDeposit = () =>
  useMutation({
    mutationFn: (input: { amount: number; gateway: 'zarinpal' | 'mellat' | 'saman' }) =>
      http.post<Envelope<{ payment: PaymentDto; payUrl: string }>>('/wallet/deposit', input),
    onError: onErr,
  });

// ════════ اعلان‌ها ════════
export const useNotifications = (page = 1, onlyUnread = false) => {
  const user = useAuthStore((s) => s.user);
  const setCounters = useAuthStore((s) => s.setCounters);
  return useQuery({
    queryKey: ['notifications', page, onlyUnread],
    queryFn: async () => {
      const [res, unread] = await Promise.all([
        http.get<PaginatedEnv<NotificationDto>>('/notifications', {
          page, per_page: 15, unread: onlyUnread ? 1 : undefined,
        }),
        http.get<Envelope<{ count: number }>>('/notifications/unread-count'),
      ]);
      setCounters({ notifications: unread.data.count });
      return res;
    },
    enabled: !!user,
  });
};

export const useMarkNotificationRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => http.put(`/notifications/${id}/read`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['notifications'] }),
    onError: onErr,
  });
};

export const useMarkAllNotificationsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => http.put('/notifications/read-all'),
    onSuccess: () => {
      toast.success('همه اعلان‌ها خوانده شد');
      void qc.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: onErr,
  });
};

// ════════ تیکت‌ها ════════
export const useTickets = (page = 1) => {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: ['tickets', page],
    queryFn: () => http.get<PaginatedEnv<TicketDto>>('/tickets', { page }),
    enabled: !!user,
  });
};

export const useTicket = (id: string | number) => {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: ['ticket', String(id)],
    queryFn: () => http.get<Envelope<TicketDto>>(`/tickets/${id}`),
    enabled: !!user && !!id,
  });
};

export const useCreateTicket = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { department: string; subject: string; priority: string; order_id?: number; message: string }) =>
      http.post<Envelope<TicketDto>>('/tickets', input),
    onSuccess: () => {
      toast.success('تیکت شما با موفقیت ثبت شد');
      void qc.invalidateQueries({ queryKey: ['tickets'] });
    },
    onError: onErr,
  });
};

export const useTicketMessage = (ticketId: string | number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (message: string) =>
      http.post<Envelope<unknown>>(`/tickets/${ticketId}/messages`, { body: message }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['ticket', String(ticketId)] }),
    onError: onErr,
  });
};

export const useCloseTicket = (ticketId?: string | number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id?: string | number) => http.put(`/tickets/${id ?? ticketId}/close`),
    onSuccess: () => {
      toast.success('تیکت بسته شد');
      void qc.invalidateQueries({ queryKey: ['tickets'] });
      void qc.invalidateQueries({ queryKey: ['ticket', String(ticketId)] });
    },
    onError: onErr,
  });
};

// ════════ پروفایل ════════
export const useUpdateProfile = () => {
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: (input: ProfileInput) => http.put<Envelope<AuthUser>>('/auth/me/update', input),
    onSuccess: (res) => {
      setUser(res.data);
      toast.success('اطلاعات حساب به‌روزرسانی شد');
    },
    onError: onErr,
  });
};

export const useChangePassword = () =>
  useMutation({
    mutationFn: (input: ChangePasswordInput) => http.put<Envelope<{ message: string }>>('/auth/me/change-password', input),
    onSuccess: (res) => toast.success(res.data.message),
    onError: onErr,
  });

// ════════ فروشندگی ════════
export const useSellerRegister = () =>
  useMutation({
    mutationFn: (input: Record<string, unknown>) =>
      http.post<Envelope<{ message?: string }>>('/seller/register', input),
    onError: onErr,
  });
