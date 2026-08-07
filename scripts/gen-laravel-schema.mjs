/**
 * ژنراتور اسکیمای لاراول از روی src/types/domain.ts (منبع حقیقت اسکیما)
 * خروجی:
 *  - backend/database/migrations/2026_01_01_00XX01_create_<module>_tables.php
 *  - backend/app/Models/<Model>.php
 * اجرا: node scripts/gen-laravel-schema.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const domainSrc = readFileSync('src/types/domain.ts', 'utf8');

// ── ۱) جدول ← اینترفیس (برابر Database در src/server/db/index.ts) و گروه‌بندی ماژولی ──
const MODULES = [
  ['core_users', { users: 'User', addresses: 'Address', provinces: 'Province', cities: 'City', otp_codes: 'OtpCode', personal_access_tokens: 'PersonalAccessToken' }],
  ['catalog', { categories: 'Category', brands: 'Brand', colors: 'Color', sizes: 'Size', guarantees: 'Guarantee', attributes: 'Attribute', attribute_values: 'AttributeValue' }],
  ['products', { products: 'Product', product_variants: 'ProductVariant', product_images: 'ProductImage', product_videos: 'ProductVideo', product_attributes: 'ProductAttribute', product_price_history: 'ProductPriceHistory', product_questions: 'ProductQuestion' }],
  ['reviews', { reviews: 'Review', review_reactions: 'ReviewReaction', review_images: 'ReviewImage' }],
  ['orders', { carts: 'Cart', cart_items: 'CartItem', orders: 'Order', order_items: 'OrderItem', order_status_history: 'OrderStatusHistory', shipping_methods: 'ShippingMethod' }],
  ['payments', { payments: 'Payment', wallets: 'Wallet', wallet_transactions: 'WalletTransaction' }],
  ['discounts', { coupons: 'Coupon', special_offers: 'SpecialOffer' }],
  ['engagement', { wishlists: 'Wishlist', compare_lists: 'CompareList', compare_list_items: 'CompareListItem', notifications: 'AppNotification', push_subscriptions: 'PushSubscription' }],
  ['cms', { pages: 'Page', banners: 'Banner', sliders: 'Slider', menus: 'Menu', blog_posts: 'BlogPost', faqs: 'Faq' }],
  ['sellers', { sellers: 'Seller', seller_settlements: 'SellerSettlement' }],
  ['support', { tickets: 'Ticket', ticket_messages: 'TicketMessage' }],
  ['analytics', { page_views: 'PageView', search_logs: 'SearchLog', product_clicks: 'ProductClick', activity_logs: 'ActivityLog', stock_alerts: 'StockAlert', stock_movements: 'StockMovement', settings: null }],
];

// ── ۲) پارس union typeها و interfaceها ──
const UNIONS = {};
for (const m of domainSrc.matchAll(/export type (\w+)\s*=\s*([\s\S]*?);/g)) {
  const values = [...m[2].matchAll(/'([^']+)'/g)].map((v) => v[1]);
  if (values.length) UNIONS[m[1]] = values;
}
const IFACES = {};
for (const m of domainSrc.matchAll(/export interface (\w+) \{([\s\S]*?)\n\}/g)) {
  const fields = [];
  for (const line of m[2].split('\n')) {
    const f = line.match(/^\s*(\w+)(\?)?:\s*([^;]+);/);
    if (f) fields.push({ name: f[1], optional: !!f[2], type: f[3].split('//')[0].replace(/\s+/g, '') });
  }
  IFACES[m[1]] = fields;
}
const tableIfaces = new Set(Object.values(Object.fromEntries(MODULES.map(([, t]) => t))).flat().filter(Boolean));
const OVERRIDES = { notifications: 'AppNotification', settings: 'Setting', addresses: 'Address', categories: 'Category', cities: 'City' };

// فیلدهای متنی بلند
const TEXT_FIELDS = new Set(['body', 'full_address', 'short_description', 'description', 'answer', 'question', 'notes', 'cancellation_reason', 'excerpt', 'endpoint', 'user_agent', 'address']);
const UNIQUE = new Set(['users.phone', 'orders.order_number', 'coupons.code', 'products.sku', 'categories.slug', 'brands.slug']);
const INDEXED = new Set(['status', 'role', 'type', 'position', 'department', 'priority', 'method', 'slug']);
const MONEY = /(price|amount|cost|balance|subtotal|tax|discount|value|max_per_order|^stock$|^sold_count$)/;

function col(table, f, next) {
  const { name } = f;
  let base = f.type.replace(/\|null/g, '');
  const nullable = f.optional || f.type.includes('|null');
  const N = nullable ? '->nullable()' : '';

  if (name === 'id' && base === 'ID') return [`$table->id();`];
  if (name === 'deleted_at') return [`$table->softDeletes();`];
  if (name === 'created_at' && next?.name === 'updated_at' && next.type.includes('ISODateString'))
    return [`$table->timestamps();`, 'skip'];
  if (name === 'created_at') return [`$table->timestamp('created_at')${N};`];
  if (name === 'updated_at') return [`$table->timestamp('updated_at')${N};`];
  if (base === 'ISODateString') return [`$table->${name === 'birth_date' ? 'date' : 'timestamp'}('${name}')${N};`];
  if (base === 'boolean') return [`$table->boolean('${name}');`];
  if (base === 'number') {
    if (name === 'lat') return [`$table->decimal('lat', 10, 7)${N};`];
    if (name === 'lng') return [`$table->decimal('lng', 11, 7)${N};`];
    if (name === 'commission_rate') return [`$table->decimal('commission_rate', 5, 2);`];
    if (name === 'rating' && table === 'sellers') return [`$table->decimal('rating', 3, 1)->default(0);`];
    if (name === 'rating') return [`$table->unsignedTinyInteger('rating');`];
    if (name === 'discount_percentage') return [`$table->unsignedInteger('discount_percentage');`];
    if (MONEY.test(name)) return [`$table->unsignedBigInteger('${name}')${N};`];
    return [`$table->unsignedInteger('${name}')${N};`];
  }
  if (base === 'ID') return [`$table->unsignedBigInteger('${name}')${N}->index();`];
  if (base === 'string') {
    if (TEXT_FIELDS.has(name)) return [`$table->text('${name}')${N};`];
    const u = UNIQUE.has(`${table}.${name}`) ? '->unique()' : INDEXED.has(name) ? '->index()' : '';
    const len = name === 'shaba_number' ? 26 : name === 'phone' || name === 'receiver_phone' ? 16 : name === 'national_code' || name === 'postal_code' ? 16 : name === 'hex_code' ? 9 : null;
    return [`$table->string('${name}'${len ? `, ${len}` : ''})${u}${N};`];
  }
  // union enum محلی
  if (UNIONS[base])
    return [
      `$table->string('${name}', ${Math.max(20, ...UNIONS[base].map((v) => v.length + 4))})${INDEXED.has(name) ? '->index()' : ''}${N}; // enum: ${UNIONS[base].join(' | ')}`,
    ];
  // عددی یونیون مثل rating: 1|2|3|4|5
  if (/^\d+(\|\d+)+$/.test(base)) return [`$table->unsignedTinyInteger('${name}');`];
  // آرایه / Json / آبجکت تو در تو
  if (base.endsWith('[]') || base === 'Json' || (IFACES[base] && !tableIfaces.has(base)))
    return [`$table->json('${name}')${N};`];
  return [`$table->string('${name}')${N}; /* TODO ${f.type} */`];
}

function casts(table, fields) {
  const c = {};
  for (const f of fields) {
    const base = f.type.replace(/\|null/g, '');
    if (['id', 'created_at', 'updated_at', 'deleted_at'].includes(f.name)) continue;
    if (base === 'boolean') c[f.name] = 'boolean';
    else if (base === 'ISODateString') c[f.name] = f.name === 'birth_date' ? 'date' : 'datetime';
    else if (base === 'number') c[f.name] = ['lat', 'lng'].includes(f.name) ? 'decimal:7' : f.name === 'commission_rate' ? 'decimal:2' : f.name === 'rating' && table === 'sellers' ? 'decimal:1' : 'integer';
    else if (base.endsWith('[]') || base === 'Json' || (IFACES[base] && !tableIfaces.has(base))) c[f.name] = 'array';
    else if (/^\d+(\|\d+)+$/.test(base)) c[f.name] = 'integer';
    else if (base === 'ID') c[f.name] = 'integer';
  }
  return c;
}

// ── ۳) تولید مایگریشن‌ها ──
mkdirSync('backend/database/migrations', { recursive: true });
mkdirSync('backend/app/Models', { recursive: true });
let seq = 0;
for (const [module, tables] of MODULES) {
  seq += 1;
  const up = [];
  const down = [];
  for (const [table, iface] of Object.entries(tables)) {
    if (table === 'settings') {
      up.push(`        Schema::create('settings', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->text('value');
        });`);
    } else {
      const fields = IFACES[iface];
      const lines = [];
      for (let i = 0; i < fields.length; i++) {
        const [line, flag] = col(table, fields[i], fields[i + 1]);
        lines.push(line);
        if (flag === 'skip') i++;
      }
      up.push(`        Schema::create('${table}', function (Blueprint $table) {
            ${lines.join('\n            ')}
        });`);
    }
    down.unshift(`        Schema::dropIfExists('${table}');`);
  }
  const php = `<?php

/**
 * مایگریشن ماژول ${module} — تولیدشده خودکار از src/types/domain.ts
 * نکته: کلیدهای خارجی عمداً به‌صورت index تعریف شده‌اند (بدون constraint) تا
 * سید/ترانکت ساده بماند؛ در سخت‌گیری پروداکشن می‌توان FK اضافه کرد.
 */
use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
${up.join('\n')}
    }

    public function down(): void
    {
${down.join('\n')}
    }
};
`;
  writeFileSync(`backend/database/migrations/2026_01_01_00${String(seq).padStart(2, '0')}01_create_${module}_tables.php`, php);
  console.log(`migration: ${module} (${Object.keys(tables).length} tables)`);
}

// ── ۴) تولید مدل‌ها ──
for (const [, tables] of MODULES) {
  for (const [table, iface] of Object.entries(tables)) {
    if (table === 'settings') {
      writeFileSync(`backend/app/Models/Setting.php`, `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;

/** جدول تنظیمات سراسری (key/value) */
class Setting extends Model
{
    protected $table = 'settings';
    protected $primaryKey = 'key';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;
    protected $guarded = [];
}
`);
      continue;
    }
    const model = OVERRIDES[table] ?? iface;
    const fields = IFACES[iface];
    const hasTs = fields.some((f) => f.name === 'created_at') && fields.some((f) => f.name === 'updated_at');
    const hasSoft = fields.some((f) => f.name === 'deleted_at');
    const csts = casts(table, fields);
    const castLines = Object.entries(csts).map(([k, v]) => `            '${k}' => '${v}',`);
    const php = `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
${hasSoft ? "use Illuminate\\Database\\Eloquent\\SoftDeletes;\n" : ''}
/** جدول ${table} — معادل اینترفیس ${iface} در domain.ts */
class ${model} extends Model
{
${hasSoft ? '    use SoftDeletes;\n\n' : ''}    protected $table = '${table}';
    protected $guarded = [];
${hasTs ? '' : '    public $timestamps = false;\n'}
${castLines.length ? `    protected $casts = [\n${castLines.join('\n')}\n    ];\n` : ''}}
`;
    writeFileSync(`backend/app/Models/${model}.php`, php);
  }
}
console.log('✓ migrations + models generated');
