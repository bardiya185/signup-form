import type * as D from '@/types/domain';

const iso = (d: string) => `${d}T10:00:00Z`;

// ─── سفارش‌های سابقه (برای داشبورد کاربر/ادمین/فروشنده) ───
export const orders: D.Order[] = [
  {
    id: 1, user_id: 2, address_id: 1, order_number: 'GNK-100241',
    status: 'delivered', payment_status: 'paid', payment_method: 'zarinpal',
    subtotal: 76350000, shipping_cost: 0, tax_amount: 0, discount_amount: 0,
    total_amount: 76350000, coupon_id: null, coupon_discount: 0, notes: null,
    shipped_at: iso('2026-07-22'), delivered_at: iso('2026-07-25'),
    cancelled_at: null, cancellation_reason: null,
    created_at: iso('2026-07-21'), updated_at: iso('2026-07-25'), deleted_at: null,
  },
  {
    id: 2, user_id: 2, address_id: 1, order_number: 'GNK-100255',
    status: 'shipped', payment_status: 'paid', payment_method: 'mellat',
    subtotal: 89600000, shipping_cost: 0, tax_amount: 0, discount_amount: 0,
    total_amount: 89600000, coupon_id: null, coupon_discount: 0, notes: 'لطفاً با دقت بسته‌بندی شود',
    shipped_at: iso('2026-08-05'), delivered_at: null,
    cancelled_at: null, cancellation_reason: null,
    created_at: iso('2026-08-04'), updated_at: iso('2026-08-05'), deleted_at: null,
  },
  {
    id: 3, user_id: 2, address_id: 2, order_number: 'GNK-100261',
    status: 'processing', payment_status: 'paid', payment_method: 'zarinpal',
    subtotal: 16589000, shipping_cost: 0, tax_amount: 0, discount_amount: 150000,
    total_amount: 16589000, coupon_id: 2, coupon_discount: 150000, notes: null,
    shipped_at: null, delivered_at: null,
    cancelled_at: null, cancellation_reason: null,
    created_at: iso('2026-08-06'), updated_at: iso('2026-08-06'), deleted_at: null,
  },
  {
    id: 4, user_id: 2, address_id: 1, order_number: 'GNK-100268',
    status: 'pending', payment_status: 'pending', payment_method: 'zarinpal',
    subtotal: 454000, shipping_cost: 45000, tax_amount: 0, discount_amount: 0,
    total_amount: 499000, coupon_id: null, coupon_discount: 0, notes: null,
    shipped_at: null, delivered_at: null,
    cancelled_at: null, cancellation_reason: null,
    created_at: '2026-08-07T06:00:00Z', updated_at: '2026-08-07T06:00:00Z', deleted_at: null,
  },
  {
    id: 5, user_id: 3, address_id: 1, order_number: 'GNK-100233',
    status: 'delivered', payment_status: 'paid', payment_method: 'mellat',
    subtotal: 21890000, shipping_cost: 0, tax_amount: 0, discount_amount: 0,
    total_amount: 21890000, coupon_id: null, coupon_discount: 0, notes: null,
    shipped_at: iso('2026-07-19'), delivered_at: iso('2026-07-22'),
    cancelled_at: null, cancellation_reason: null,
    created_at: iso('2026-07-18'), updated_at: iso('2026-07-22'), deleted_at: null,
  },
  {
    id: 6, user_id: 3, address_id: 1, order_number: 'GNK-100247',
    status: 'cancelled', payment_status: 'failed', payment_method: 'zarinpal',
    subtotal: 5900000, shipping_cost: 0, tax_amount: 0, discount_amount: 0,
    total_amount: 5900000, coupon_id: null, coupon_discount: 0, notes: null,
    shipped_at: null, delivered_at: null,
    cancelled_at: iso('2026-07-28'), cancellation_reason: 'انصراف از خرید توسط کاربر',
    created_at: iso('2026-07-28'), updated_at: iso('2026-07-28'), deleted_at: null,
  },
];

export const orderItems: D.OrderItem[] = [
  { id: 1, order_id: 1, product_variant_id: 1, product_title: 'گوشی موبایل اپل مدل iPhone 15 Pro ظرفیت 256 گیگابایت', variant_info: { sku: 'IP15P-256-TN', color: 'تیتانیوم طبیعی', guarantee: 'گارانتی ۲۴ ماهه رسمی' }, quantity: 1, unit_price: 74900000, total_price: 74900000, created_at: iso('2026-07-21'), updated_at: '' },
  { id: 2, order_id: 1, product_variant_id: 36, product_title: 'سرم ضدلک ویتامین C لا روش-پوزای مدل Pure Vitamin C10', variant_info: { sku: 'LRP-C10-30', guarantee: 'ضمانت اصالت و سلامت فیزیکی کالا' }, quantity: 1, unit_price: 1450000, total_price: 1450000, created_at: iso('2026-07-21'), updated_at: '' },
  { id: 3, order_id: 2, product_variant_id: 8, product_title: 'لپ‌تاپ 15.6 اینچی ایسوس مدل TUF Gaming F15 FX507', variant_info: { sku: 'TUF-F15-BK', color: 'مشکی', guarantee: 'گارانتی ۲۴ ماهه رسمی' }, quantity: 1, unit_price: 54900000, total_price: 54900000, created_at: iso('2026-08-04'), updated_at: '' },
  { id: 4, order_id: 2, product_variant_id: 19, product_title: 'کنسول بازی سونی مدل PlayStation 5 Slim ظرفیت 1 ترابایت', variant_info: { sku: 'PS5S-1TB-WT', color: 'سفید', guarantee: 'گارانتی ۲۴ ماهه رسمی' }, quantity: 1, unit_price: 34700000, total_price: 34700000, created_at: iso('2026-08-04'), updated_at: '' },
  { id: 5, order_id: 3, product_variant_id: 12, product_title: 'هدفون بی‌سیم سونی مدل WH-1000XM5', variant_info: { sku: 'XM5-CR', color: 'کرم', guarantee: 'گارانتی ۱۸ ماهه شرکتی' }, quantity: 1, unit_price: 16400000, total_price: 16400000, created_at: iso('2026-08-06'), updated_at: '' },
  { id: 6, order_id: 3, product_variant_id: 35, product_title: 'کتاب کیمیاگر اثر پائلو کوئیلو', variant_info: { sku: 'BK-ALCH-001', guarantee: 'ضمانت اصالت و سلامت فیزیکی کالا' }, quantity: 1, unit_price: 189000, total_price: 189000, created_at: iso('2026-08-06'), updated_at: '' },
  { id: 7, order_id: 4, product_variant_id: 34, product_title: 'کتاب هنر شفاف اندیشیدن اثر رولف دوبلی', variant_info: { sku: 'BK-AOTC-001', guarantee: 'ضمانت اصالت و سلامت فیزیکی کالا' }, quantity: 1, unit_price: 265000, total_price: 265000, created_at: '2026-08-07T06:00:00Z', updated_at: '' },
  { id: 8, order_id: 4, product_variant_id: 35, product_title: 'کتاب کیمیاگر اثر پائلو کوئیلو', variant_info: { sku: 'BK-ALCH-001', guarantee: 'ضمانت اصالت و سلامت فیزیکی کالا' }, quantity: 1, unit_price: 189000, total_price: 189000, created_at: '2026-08-07T06:00:00Z', updated_at: '' },
  { id: 9, order_id: 5, product_variant_id: 24, product_title: 'مخلوط‌کن فیلیپس مدل HR2223 ظرفیت 2 لیتر', variant_info: { sku: 'HR2223-BL', color: 'آبی', guarantee: 'گارانتی ۲۴ ماهه رسمی' }, quantity: 1, unit_price: 3990000, total_price: 3990000, created_at: iso('2026-07-18'), updated_at: '' },
  { id: 10, order_id: 5, product_variant_id: 11, product_title: 'هدفون بی‌سیم سونی مدل WH-1000XM5', variant_info: { sku: 'XM5-BK', color: 'مشکی', guarantee: 'گارانتی ۱۸ ماهه شرکتی' }, quantity: 1, unit_price: 17900000, total_price: 17900000, created_at: iso('2026-07-18'), updated_at: '' },
  { id: 11, order_id: 6, product_variant_id: 27, product_title: 'کفش راحتی مردانه نایک مدل Air Max 270', variant_info: { sku: 'AM270-RD-42', color: 'قرمز', size: '42', guarantee: 'ضمانت اصالت و سلامت فیزیکی کالا' }, quantity: 1, unit_price: 5900000, total_price: 5900000, created_at: iso('2026-07-28'), updated_at: '' },
];

export const orderStatusHistory: D.OrderStatusHistory[] = [
  { id: 1, order_id: 1, old_status: null, new_status: 'pending', description: 'سفارش ثبت شد', changed_by: null, created_at: iso('2026-07-21'), updated_at: '' },
  { id: 2, order_id: 1, old_status: 'pending', new_status: 'processing', description: 'پرداخت تایید شد؛ سفارش در حال آماده‌سازی', changed_by: null, created_at: iso('2026-07-21'), updated_at: '' },
  { id: 3, order_id: 1, old_status: 'processing', new_status: 'shipped', description: 'سفارش به پست تحویل داده شد', changed_by: 1, created_at: iso('2026-07-22'), updated_at: '' },
  { id: 4, order_id: 1, old_status: 'shipped', new_status: 'delivered', description: 'سفارش به گیرنده تحویل داده شد', changed_by: 1, created_at: iso('2026-07-25'), updated_at: '' },
  { id: 5, order_id: 2, old_status: null, new_status: 'pending', description: 'سفارش ثبت شد', changed_by: null, created_at: iso('2026-08-04'), updated_at: '' },
  { id: 6, order_id: 2, old_status: 'pending', new_status: 'processing', description: 'پرداخت تایید شد', changed_by: null, created_at: iso('2026-08-04'), updated_at: '' },
  { id: 7, order_id: 2, old_status: 'processing', new_status: 'shipped', description: 'سفارش به پست تحویل داده شد', changed_by: 1, created_at: iso('2026-08-05'), updated_at: '' },
  { id: 8, order_id: 3, old_status: null, new_status: 'pending', description: 'سفارش ثبت شد', changed_by: null, created_at: iso('2026-08-06'), updated_at: '' },
  { id: 9, order_id: 3, old_status: 'pending', new_status: 'processing', description: 'پرداخت تایید شد', changed_by: null, created_at: iso('2026-08-06'), updated_at: '' },
  { id: 10, order_id: 4, old_status: null, new_status: 'pending', description: 'سفارش ثبت شد', changed_by: null, created_at: '2026-08-07T06:00:00Z', updated_at: '' },
  { id: 11, order_id: 5, old_status: null, new_status: 'delivered', description: 'سفارش تکمیل شد', changed_by: 1, created_at: iso('2026-07-22'), updated_at: '' },
  { id: 12, order_id: 6, old_status: null, new_status: 'cancelled', description: 'انصراف از خرید توسط کاربر', changed_by: 3, created_at: iso('2026-07-28'), updated_at: '' },
];

// ─── پرداخت‌ها ───
export const payments: D.Payment[] = [
  { id: 1, user_id: 2, order_id: 1, amount: 76350000, method: 'zarinpal', status: 'success', transaction_id: 'A100241ZP', ref_number: '481200241001', gateway_response: { gateway: 'zarinpal', card_pan: '6037-99**-****-4521' }, paid_at: iso('2026-07-21'), created_at: iso('2026-07-21'), updated_at: '' },
  { id: 2, user_id: 2, order_id: 2, amount: 89600000, method: 'mellat', status: 'success', transaction_id: 'A100255ML', ref_number: '512300255002', gateway_response: { gateway: 'mellat', card_pan: '6104-33**-****-1120' }, paid_at: iso('2026-08-04'), created_at: iso('2026-08-04'), updated_at: '' },
  { id: 3, user_id: 2, order_id: 3, amount: 16589000, method: 'zarinpal', status: 'success', transaction_id: 'A100261ZP', ref_number: '481200261003', gateway_response: { gateway: 'zarinpal' }, paid_at: iso('2026-08-06'), created_at: iso('2026-08-06'), updated_at: '' },
  { id: 4, user_id: 3, order_id: 5, amount: 21890000, method: 'mellat', status: 'success', transaction_id: 'A100233ML', ref_number: '512300233004', gateway_response: { gateway: 'mellat' }, paid_at: iso('2026-07-18'), created_at: iso('2026-07-18'), updated_at: '' },
  { id: 5, user_id: 3, order_id: 6, amount: 5900000, method: 'zarinpal', status: 'failed', transaction_id: 'A100247ZP', ref_number: null, gateway_response: { gateway: 'zarinpal', error: 'تراکنش توسط کاربر لغو شد' }, paid_at: null, created_at: iso('2026-07-28'), updated_at: '' },
];

export const walletTransactions: D.WalletTransaction[] = [
  { id: 1, wallet_id: 1, type: 'deposit', amount: 500000, description: 'شارژ کیف پول', reference_id: 'GWK-88120', created_at: iso('2026-07-10'), updated_at: '' },
  { id: 2, wallet_id: 1, type: 'withdraw', amount: 250000, description: 'پرداخت بخشی از سفارش GNK-100199', reference_id: 'GNK-100199', created_at: iso('2026-07-12'), updated_at: '' },
];

// ─── اعلان‌ها ───
export const notifications: D.AppNotification[] = [
  { id: 1, user_id: 2, type: 'order_status', title: 'سفارش شما ارسال شد', body: 'سفارش GNK-100255 به پست تحویل داده شد و در راه است.', data: { orderNumber: 'GNK-100255' }, read_at: null, created_at: iso('2026-08-05'), updated_at: '' },
  { id: 2, user_id: 2, type: 'promotion', title: 'کد تخفیف مخصوص شما', body: 'با کد GINAN10 از ۱۰٪ تخفیف روی خرید بعدی بهره‌مند شوید.', data: { code: 'GINAN10' }, read_at: null, created_at: iso('2026-08-06'), updated_at: '' },
  { id: 3, user_id: 2, type: 'system', title: 'به گینان‌کالا خوش آمدید', body: 'حساب کاربری شما با موفقیت ایجاد شد.', data: null, read_at: iso('2026-02-10'), created_at: iso('2026-02-10'), updated_at: '' },
  { id: 4, user_id: 3, type: 'order_status', title: 'سفارش شما لغو شد', body: 'سفارش GNK-100247 به درخواست شما لغو شد.', data: { orderNumber: 'GNK-100247' }, read_at: null, created_at: iso('2026-07-28'), updated_at: '' },
];

// ─── تیکت‌ها ───
export const tickets: D.Ticket[] = [
  { id: 1, user_id: 2, order_id: 2, department: 'orders', subject: 'پیگیری مرسوله ارسال‌شده', priority: 'medium', status: 'answered', created_at: iso('2026-08-05'), updated_at: iso('2026-08-06') },
  { id: 2, user_id: 3, order_id: 6, department: 'payments', subject: 'عدم بازگشت مبلغ به حساب', priority: 'high', status: 'open', created_at: iso('2026-07-29'), updated_at: iso('2026-07-29') },
];

export const ticketMessages: D.TicketMessage[] = [
  { id: 1, ticket_id: 1, user_id: 2, body: 'سلام، بسته‌ام طبق رهگیری پستی در حال توزیع است ولی هنوز نرسیده. چه زمانی تحویل داده می‌شود؟', attachments: [], is_admin: false, created_at: '2026-08-05T18:00:00Z', updated_at: '' },
  { id: 2, ticket_id: 1, user_id: 1, body: 'سلام و وقت بخیر. مرسوله شما امروز تا ساعت ۲۰ تحویل داده می‌شود. کد رهگیری: 7550-0212-3344', attachments: [], is_admin: true, created_at: '2026-08-06T09:30:00Z', updated_at: '' },
  { id: 3, ticket_id: 2, user_id: 3, body: 'پرداخت سفارشم ناموفق شد ولی مبلغ از حسابم کم شده و برنگشته. لطفاً بررسی کنید.', attachments: [], is_admin: false, created_at: '2026-07-29T11:00:00Z', updated_at: '' },
];

// ─── بلاگ ───
const post = (
  id: number, title: string, slug: string, excerpt: string, image: string,
  view_count: number, published_at: string,
): D.BlogPost => ({
  id, author_id: 1, title, slug, excerpt, body: excerpt + ' در ادامه این مطلب به بررسی کامل موضوع می‌پردازیم و نکات کاربردی خرید را مرور می‌کنیم. انتخاب درست محصول بر اساس نیاز واقعی، مهم‌ترین اصل خرید هوشمندانه است.',
  image, category_id: null, status: 'published', published_at,
  view_count, meta_title: title, meta_description: excerpt,
  created_at: published_at, updated_at: '', deleted_at: null,
});

export const blogPosts: D.BlogPost[] = [
  post(1, 'راهنمای خرید لپ‌تاپ در سال ۲۰۲۶', 'laptop-buying-guide-2026',
    'قبل از خرید لپ‌تاپ این نکات را بدانید: از پردازنده و رم تا وزن و باتری.',
    '/products/tech-photo.jpg', 5400, iso('2026-07-15')),
  post(2, 'چطور کنسول بازی مناسب را انتخاب کنیم؟', 'how-to-choose-game-console',
    'مقایسه PlayStation و Xbox از نظر بازی‌های انحصاری، قیمت و سرویس‌ها.',
    '/products/real/unique/console.jpg', 7800, iso('2026-07-28')),
  post(3, '۵ نکته طلایی مراقبت از پوست در تابستان', 'summer-skincare-tips',
    'با این ۵ نکته ساده از پوستتان در برابر آفتاب تابستان محافظت کنید.',
    '/products/lifestyle-photo.jpg', 3200, iso('2026-08-02')),
];

// ─── علاقه‌مندی‌ها و مقایسه ───
export const wishlists: D.Wishlist[] = [
  { id: 1, user_id: 2, product_id: 12, created_at: iso('2026-08-01'), updated_at: '' },
  { id: 2, user_id: 2, product_id: 21, created_at: iso('2026-08-03'), updated_at: '' },
  { id: 3, user_id: 2, product_id: 22, created_at: iso('2026-08-04'), updated_at: '' },
];

export const compareLists: D.CompareList[] = [
  { id: 1, user_id: 2, session_id: null, category_id: 2, created_at: iso('2026-08-05'), updated_at: '' },
];

export const compareListItems: D.CompareListItem[] = [
  { id: 1, compare_list_id: 1, product_id: 1, created_at: '', updated_at: '' },
  { id: 2, compare_list_id: 1, product_id: 2, created_at: '', updated_at: '' },
  { id: 3, compare_list_id: 1, product_id: 3, created_at: '', updated_at: '' },
];

// ─── تسویه فروشندگان ───
export const sellerSettlements: D.SellerSettlement[] = [
  { id: 1, seller_id: 1, amount: 12000000, status: 'paid', paid_at: iso('2026-08-01'), reference: 'ST-2026-1001', created_at: iso('2026-07-28'), updated_at: '' },
  { id: 2, seller_id: 1, amount: 8400000, status: 'pending', paid_at: null, reference: null, created_at: iso('2026-08-05'), updated_at: '' },
  { id: 3, seller_id: 2, amount: 3450000, status: 'pending', paid_at: null, reference: null, created_at: iso('2026-08-06'), updated_at: '' },
  { id: 4, seller_id: 4, amount: 5200000, status: 'paid', paid_at: iso('2026-08-02'), reference: 'ST-2026-1004', created_at: iso('2026-07-30'), updated_at: '' },
];

// ─── تنظیمات سایت (Settings Table) ───
export const settings: Record<string, string> = {
  site_name: 'گینان‌کالا',
  site_description: 'فروشگاه اینترنتی گینان‌کالا، تجربه‌ای مطمئن برای خرید آنلاین',
  support_phone: '021-91001100',
  support_email: 'support@ginankala.ir',
  free_shipping_threshold: '2000000',
  default_shipping_method_id: '1',
  return_period_days: '7',
  incredible_offers_enabled: '1',
  maintenance_mode: '0',
};
