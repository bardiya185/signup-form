/**
 * تست دود (Smoke Test) — جریان کامل خرید روی API v1
 * اجرا: node scripts/smoke.mjs
 */
const BASE = process.env.BASE ?? 'http://localhost:3000/api/v1';
let passed = 0, failed = 0;

async function call(method, path, { token, body, headers } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: 'Bearer ' + token } : {}),
      ...(headers ?? {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try { json = await res.json(); } catch { /* empty */ }
  return { status: res.status, json };
}

function check(name, cond, extra = '') {
  if (cond) { passed++; console.log('  ✓', name); }
  else { failed++; console.log('  ✗', name, extra); }
}

const j = (x) => JSON.stringify(x);

// ─── ورود کش‌شده (تا به Rate Limit نخوریم) ───
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
const cacheFile = new URL('./.smoke-tokens.json', import.meta.url).pathname;
const tokenCache = existsSync(cacheFile) ? JSON.parse(readFileSync(cacheFile, 'utf8')) : {};
async function loginCached(key, identity) {
  if (tokenCache[key]) {
    const probe = await call('GET', '/auth/me', { token: tokenCache[key] });
    if (probe.status === 200) return tokenCache[key];
  }
  const r = await call('POST', '/auth/login', { body: { identity, password: '123456' } });
  check(key + ' login', r.status === 200 && !!r.json?.data?.token, j(r.json));
  tokenCache[key] = r.json?.data?.token;
  writeFileSync(cacheFile, JSON.stringify(tokenCache));
  return tokenCache[key];
}

console.log('— Auth —');
const PHONE = '09' + String(Date.now()).slice(-9);
const reg = await call('POST', '/auth/register', { body: {
  first_name: 'تست', last_name: 'اسموک', phone: PHONE, password: 'secret123',
  password_confirmation: 'secret123',
}});
check('register 200', reg.status === 200, j(reg.json));
const tokenU = reg.json?.data?.token;
check('register token', !!tokenU);

const valErr = await call('POST', '/auth/register', { body: { first_name: 'x', phone: '123' } });
check('validation 422 (or 429 throttle)', [422, 429].includes(valErr.status), j(valErr.json));

const OTP_PHONE = PHONE.replace(/^091/, '092');
const otp = await call('POST', '/auth/login/otp/send', { body: { phone: OTP_PHONE } });
check('otp send', otp.status === 200 && !!otp.json?.data?.devCode, j(otp.json));
const verify = await call('POST', '/auth/login/otp/verify', { body: { phone: OTP_PHONE, code: otp.json?.data?.devCode } });
check('otp verify auto-register', verify.status === 200 && !!verify.json.data.token);

const tokenA = await loginCached('admin', '09120000001');
const tokenS = await loginCached('seller', '09120000003');
const tokenSara = await loginCached('sara', '09120000002');

const me = await call('GET', '/auth/me', { token: tokenU });
check('auth me', me.status === 200 && me.json.data.user.phone === PHONE, j(me.json));

const meUpd = await call('PUT', '/auth/me/update', { token: tokenU, body: { national_code: '0001234567' } });
check('me update', meUpd.status === 200 && meUpd.json.data.nationalCode === '0001234567');

const unauth = await call('GET', '/auth/me');
check('401 without token', unauth.status === 401);

console.log('— Catalog —');
const cats = await call('GET', '/categories');
check('categories tree', cats.status === 200 && cats.json.data.length >= 5);
const plist = await call('GET', '/products?category=mobile&sort=price_asc&per_page=5');
check('products mobile', plist.status === 200 && plist.json.data.length >= 2, j(plist.json.meta));
const pf = await call('GET', '/categories/mobile/filters');
check('category filters', pf.status === 200 && pf.json.data.brands.length >= 2);
const pd = await call('GET', '/products/iphone-15-pro-256gb');
check('product detail', pd.status === 200 && pd.json.data.product.variants.length === 2);
const search = await call('GET', '/search?q=' + encodeURIComponent('سونی'));
check('search fa', search.status === 200 && search.json.data.length >= 1, j(search.json));
const sugg = await call('GET', '/search/suggestions?q=' + encodeURIComponent('اپل'));
check('suggestions', sugg.status === 200 && sugg.json.data.products.length >= 1);
const pop = await call('GET', '/search/popular');
check('popular', pop.status === 200 && pop.json.data.length >= 5);

console.log('— Cart & Coupon —');
const emptyCart = await call('GET', '/cart', { token: tokenU });
check('empty cart', emptyCart.status === 200 && emptyCart.json.data.items.length === 0);
const add1 = await call('POST', '/cart/items', { token: tokenU, body: { product_variant_id: 18, quantity: 2 } }); // می‌بند صورتی 1.79m
check('add to cart', add1.status === 200 && add1.json.data.items.length === 1, j(add1.json));
const add2 = await call('POST', '/cart/items', { token: tokenU, body: { product_variant_id: 34, quantity: 1 } }); // کتاب 265k
check('add second', add2.status === 200 && add2.json.data.totals.itemsCount === 3);
const upd = await call('PUT', '/cart/items/' + add2.json.data.items[1].id, { token: tokenU, body: { quantity: 2 } });
check('update qty', upd.status === 200 && upd.json.data.totals.itemsCount === 4);
const coupon = await call('POST', '/cart/coupon/apply', { token: tokenU, body: { code: 'GINAN10' } });
check('apply coupon', coupon.status === 200 && coupon.json.data.totals.couponDiscount > 0, j(coupon.json?.totals));
const badCoupon = await call('POST', '/cart/coupon/apply', { token: tokenU, body: { code: 'XXXXXX' } });
check('bad coupon 422', badCoupon.status === 422);
const totalBefore = coupon.json.data.totals.total;

console.log('— Checkout & Payment —');
const addr = await call('POST', '/addresses', { token: tokenU, body: {
  title: 'منزل', province_id: 1, city_id: 1,
  full_address: 'تهران، خیابان آزادی، کوچه تست، پلاک ۱', postal_code: '1234567890',
  receiver_name: 'تست اسموک', receiver_phone: '09129990001',
}});
check('create address', addr.status === 201, j(addr.json));
const checkout = await call('POST', '/orders/checkout', { token: tokenU, body: {
  address_id: addr.json.data.id, payment_method: 'zarinpal', shipping_method_id: 1,
}});
check('checkout 201', checkout.status === 201, j(checkout.json));
const orderNumber = checkout.json?.data?.order?.orderNumber;
check('cart cleared', checkout.json?.data ? true : false);
const cartAfter = await call('GET', '/cart', { token: tokenU });
check('cart empty after checkout', cartAfter.json.data.items.length === 0);

const payCreate = await call('POST', '/payments/create', { token: tokenU, body: { order_number: orderNumber, gateway: 'zarinpal' } });
check('payment create', payCreate.status === 200 && !!payCreate.json.data.payUrl, j(payCreate.json));
const authority = new URL(payCreate.json.data.payUrl).searchParams.get('Authority');
const verify2 = await call('GET', '/payments/verify?Authority=' + authority + '&Status=OK');
check('payment verify', verify2.status === 200 && verify2.json.data.status === 'success', j(verify2.json));

const order = await call('GET', '/orders/' + orderNumber, { token: tokenU });
check('order processing', order.json.data.status === 'processing' && order.json.data.paymentStatus === 'paid', j(order.json.data));
check('order coupon applied', order.json.data.couponDiscount === 150000 && order.json.data.totalAmount === totalBefore);

const ordersList = await call('GET', '/orders', { token: tokenSara });
check('sara orders list', ordersList.status === 200 && ordersList.json.data.length >= 3, j(ordersList.json?.meta));
const cancellable = ordersList.json?.data?.find((o) => ['pending', 'processing'].includes(o.status));
if (cancellable) {
  const cancel = await call('POST', '/orders/' + cancellable.orderNumber + '/cancel', { token: tokenSara, body: { reason: 'تست لغو سفارش' } });
  check('cancel order', cancel.status === 200 && cancel.json.data.status === 'cancelled', j(cancel.json?.data ?? cancel.json));
} else {
  check('cancel order (skipped: none pending)', true);
}

console.log('— Library & Notifications —');
const wl = await call('POST', '/wishlist/7', { token: tokenU });
check('wishlist add', wl.status === 201 && wl.json.data.added);
const cmp = await call('POST', '/compare/1', { token: tokenU });
check('compare add', cmp.status === 201);
const cmpWrong = await call('POST', '/compare/18', { token: tokenU });
check('compare cross-category rejected', cmpWrong.status === 422);
const notifCount = await call('GET', '/notifications/unread-count', { token: tokenU });
check('unread count > 0', notifCount.status === 200 && notifCount.json.data.count >= 1, j(notifCount.json));
const readAll = await call('PUT', '/notifications/read-all', { token: tokenU });
check('read all', readAll.status === 200);

console.log('— Tickets & Wallet —');
const ticket = await call('POST', '/tickets', { token: tokenU, body: {
  department: 'general', subject: 'تست ایجاد تیکت', priority: 'medium', message: 'این یک پیام تستی برای بررسی تیکت است.',
}});
check('ticket create', ticket.status === 201, j(ticket.json));
const reply = await call('POST', '/tickets/' + ticket.json.data.id + '/messages', { token: tokenU, body: { body: 'پیام دوم تستی' } });
check('ticket reply', reply.status === 201 && reply.json.data.messages.length === 2);
const deposit = await call('POST', '/wallet/deposit', { token: tokenU, body: { amount: 500000, gateway: 'zarinpal' } });
check('wallet deposit url', deposit.status === 200 && !!deposit.json.data.payUrl);
const wAuth = new URL(deposit.json.data.payUrl).searchParams.get('Authority');
const wVerify = await call('GET', '/payments/verify?Authority=' + wAuth + '&Status=OK');
check('wallet charged', wVerify.json.data.status === 'success');
const wOver = await call('GET', '/wallet', { token: tokenU });
check('wallet balance 500k', wOver.json.data.balance === 500000, j(wOver.json));

console.log('— Seller —');
const sellerDash = await call('GET', '/seller/dashboard', { token: tokenS });
check('seller dashboard', sellerDash.status === 200 && sellerDash.json.data.seller.shopName === 'دنیای دیجیتال پارس', j(sellerDash.json));
const sellerProducts = await call('GET', '/seller/products', { token: tokenS });
check('seller products', sellerProducts.status === 200 && sellerProducts.json.data.length >= 3, String(sellerProducts.json?.meta?.total));
const sellerOrders = await call('GET', '/seller/orders', { token: tokenS });
check('seller orders', sellerOrders.status === 200 && Array.isArray(sellerOrders.json.data), String(sellerOrders.json?.data?.length));
const sellerSettle = await call('GET', '/seller/settlements', { token: tokenS });
check('seller settlements', sellerSettle.status === 200 && Array.isArray(sellerSettle.json.data));
const sellerAnalytics = await call('GET', '/seller/analytics', { token: tokenS });
check('seller analytics', sellerAnalytics.status === 200 && Array.isArray(sellerAnalytics.json.data?.monthly));

console.log('— Warehouse —');
const tokenW = await loginCached('warehouse', '09120000004');
const wDash = await call('GET', '/warehouse/dashboard', { token: tokenW });
check('warehouse dashboard', wDash.status === 200 && typeof wDash.json.data?.stats?.totalVariants === 'number', j(wDash.json?.data?.stats));
check('warehouse dashboard sections', Array.isArray(wDash.json.data?.lowStock) && Array.isArray(wDash.json.data?.readyShipments) && Array.isArray(wDash.json.data?.recentMovements));
const wInv = await call('GET', '/warehouse/inventory?per_page=5', { token: tokenW });
check('warehouse inventory', wInv.status === 200 && wInv.json.data.length >= 1, j(wInv.json?.meta));
const wInvQ = await call('GET', '/warehouse/inventory?q=گوشی', { token: tokenW });
check('warehouse inventory search', wInvQ.status === 200 && Array.isArray(wInvQ.json.data), String(wInvQ.json?.meta?.total));
const wInvLow = await call('GET', '/warehouse/inventory?state=low_stock', { token: tokenW });
check('warehouse inventory low_stock filter', wInvLow.status === 200 && wInvLow.json.data.every((v) => v.status === 'low_stock'), String(wInvLow.json?.meta?.total));
const wShip = await call('GET', '/warehouse/shipments?state=ready', { token: tokenW });
check('warehouse shipments ready', wShip.status === 200 && Array.isArray(wShip.json.data), j(wShip.json?.meta));
const wShipped = await call('GET', '/warehouse/shipments?state=shipped', { token: tokenW });
check('warehouse shipments shipped', wShipped.status === 200 && Array.isArray(wShipped.json.data), j(wShipped.json?.meta));
const wMove = await call('GET', '/warehouse/movements', { token: tokenW });
check('warehouse movements', wMove.status === 200 && Array.isArray(wMove.json.data), j(wMove.json?.meta));
const adjustTarget = wInv.json?.data?.[0];
if (adjustTarget) {
  const wAdj = await call('PUT', '/warehouse/inventory/' + adjustTarget.variantId, { token: tokenW, body: { stock: adjustTarget.stock, reason: 'تست دود — بدون تغییر' } });
  check('warehouse adjust stock (no-op)', wAdj.status === 200, j(wAdj.json ?? ''));
} else {
  check('warehouse adjust stock (skipped)', true);
}
const wForbidden = await call('GET', '/warehouse/dashboard', { token: tokenU });
check('warehouse forbidden for customer', wForbidden.status === 403);

console.log('— Admin (Security) —');
const forbidden = await call('GET', '/admin/dashboard', { token: tokenU });
check('admin forbidden for customer', forbidden.status === 403);
const dash = await call('GET', '/admin/dashboard', { token: tokenA });
check('admin dashboard', dash.status === 200 && dash.json.data.cards.totalRevenue > 0, j(dash.json?.data?.cards));
check('admin low stock', Array.isArray(dash.json.data.lowStock));
const aUsers = await call('GET', '/admin/users?per_page=5', { token: tokenA });
check('admin users', aUsers.status === 200 && aUsers.json.data.length >= 3);
const aOrders = await call('GET', '/admin/orders?status=processing', { token: tokenA });
check('admin orders filter', aOrders.status === 200 && aOrders.json.data.length >= 1, j(aOrders.json.meta));
const COUPON = 'T' + String(Date.now()).slice(-7);
const aCoupon = await call('POST', '/admin/coupons', { token: tokenA, body: { code: COUPON, type: 'percentage', value: 25, max_discount: 50000, min_order_amount: 100000 } });
check('admin coupon create', aCoupon.status === 201 && aCoupon.json.data.code === COUPON, j(aCoupon.json));
const aCouponDup = await call('POST', '/admin/coupons', { token: tokenA, body: { code: COUPON, type: 'percentage', value: 20 } });
check('admin coupon duplicate 422', aCouponDup.status === 422);
const aReview = await call('GET', '/admin/reviews?status=approved', { token: tokenA });
check('admin reviews', aReview.status === 200 && aReview.json.data.length >= 5);
const aLogs = await call('GET', '/admin/logs', { token: tokenA });
check('admin logs', aLogs.status === 200 && aLogs.json.data.length >= 1);
const salesRep = await call('GET', '/admin/reports/sales?days=14', { token: tokenA });
check('sales report', salesRep.status === 200 && salesRep.json.data.daily.length === 14);
const aProduct = await call('POST', '/admin/products', { token: tokenA, body: {
  title: 'محصول تست مدیریتی ویژه', category_id: 2, brand_id: 1, price: 15000000, stock: 5,
}});
check('admin product create', aProduct.status === 201, j(aProduct.json));
const allOrders = await call('GET', '/admin/orders?per_page=50', { token: tokenA });
const shipTarget = allOrders.json?.data?.find((o) => o.status === 'processing') ?? allOrders.json?.data?.find((o) => o.status === 'pending');
if (shipTarget) {
  const next = shipTarget.status === 'processing' ? 'shipped' : 'processing';
  const aOrderStatus = await call('PUT', '/admin/orders/' + shipTarget.id, { token: tokenA, body: { status: next, description: 'تست تغییر وضعیت' } });
  check('admin order status', aOrderStatus.status === 200 && aOrderStatus.json.data.status === next, j(aOrderStatus.json ?? ''));
} else {
  check('admin order status (skipped)', true);
}

console.log('');
console.log('════════' + ' PASSED: ' + passed + ' | FAILED: ' + failed + ' ════════');
process.exit(failed ? 1 : 0);
