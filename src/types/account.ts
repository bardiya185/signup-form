/**
 * ─── DTO های حساب کاربری (آینه خروجی src/server/resources.ts) ───
 */

export interface AddressDto {
  id: number;
  title: string;
  province: { id: number; name: string } | null;
  city: { id: number; name: string } | null;
  fullAddress: string;
  postalCode: string;
  receiverName: string;
  receiverPhone: string;
  isDefault: boolean;
}

export interface ProvinceDto { id: number; name: string }

export interface ShippingMethodDto {
  id: number;
  title: string;
  cost: number;
  estimated_days: number;
  is_active?: boolean;
}

export interface OrderItemDto {
  id: number;
  productVariantId: number;
  productTitle: string;
  productSlug: string | null;
  image: string | null;
  variantInfo: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderHistoryDto {
  id: number;
  oldStatus: string | null;
  newStatus: string;
  description: string | null;
  actor: string;
  createdAt: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';

export interface OrderDto {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  statusFa: string;
  paymentStatus: string;
  paymentStatusFa: string;
  paymentMethod: string;
  paymentMethodFa: string;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  couponDiscount: number;
  notes: string | null;
  cancellationReason: string | null;
  address: AddressDto;
  items: OrderItemDto[];
  itemsCount: number;
  canCancel: boolean;
  canReturn: boolean;
  buyerName: string;
  shippedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  history?: OrderHistoryDto[];
}

export interface PaymentDto {
  id: number;
  amount: number;
  method: string;
  methodFa: string;
  status: string;
  statusFa: string;
  transactionId: string;
  refNumber: string | null;
  orderNumber: string | null;
  isWalletCharge: boolean;
  paidAt: string | null;
  createdAt: string;
}

export interface CheckoutResult {
  order: OrderDto;
  payment: PaymentDto | null;
  requiresRedirect: boolean;
  payUrl: string | null;
}

export interface WalletOverviewDto {
  balance: number;
  totalDeposits: number;
  totalWithdraws: number;
  transactionsCount: number;
}

export interface WalletTransactionDto {
  id: number;
  type: 'deposit' | 'withdraw';
  typeFa: string;
  amount: number;
  description: string | null;
  referenceId: number | null;
  createdAt: string;
}

export interface NotificationDto {
  id: number;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
}

export interface TicketMessageDto {
  id: number;
  body: string;
  isAdmin: boolean;
  authorName: string;
  createdAt: string;
}

export type TicketDepartment = 'orders' | 'payments' | 'returns' | 'technical' | 'general';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TicketDto {
  id: number;
  subject: string;
  department: TicketDepartment;
  departmentFa: string;
  priority: TicketPriority;
  priorityFa: string;
  status: string;
  statusFa: string;
  orderNumber: string | null;
  requesterName: string;
  messages: TicketMessageDto[];
  lastMessageAt: string;
  createdAt: string;
}

export interface VerifyPaymentResult {
  payment: PaymentDto;
  verified: boolean;
  alreadyVerified?: boolean;
  orderNumber?: string | null;
  message: string;
}
