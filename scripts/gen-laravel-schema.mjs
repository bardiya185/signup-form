#!/usr/bin/env node
/**
 * مولد اسکیمای لاراول از حقیقتِ واحد پروژه:
 *   - نقشه جدول → نوع:   interface Database در src/server/db/index.ts
 *   - فیلدهای هر نوع:    interface های src/types/domain.ts
 * خروجی:
 *   - backend/database/migrations/2026_01_01_00XX0N_create_*_tables.php
 *   - backend/app/Models/*.php
 * اجرا: node scripts/gen-laravel-schema.mjs
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

// ─── ۱) نقشه جدول‌ها از interface Database ───
const indexTs = read('src/server/db/index.ts');
const dbMatch = indexTs.match(/interface Database \{([\s\S]*?)\n\}/);
if (!dbMatch) throw new Error('interface Database پیدا نشد');
const TABLE_TYPES = []; // [table, TypeName | 'record']
for (const line of dbMatch[1].split('\n')) {
  const m = line.match(/^\s*(\w+)(\?)?:\s*D\.(\w+)\[\];/);
  if (m) { TABLE_TYPES.push([m[1], m[3]]); continue; }
  const r = line.match(/^\s*(\w+):\s*Record<string,\s*string>;/);
  if (r) TABLE_TYPES.push([r[1], 'record']);
}

// ─── ۲) پارس interface های domain.ts ───
const domainTs = read('src/types/domain.ts');
const INTERFACES = {};
// type alias ها: export type AttributeType = 'select' | 'text'; / export type ID = number;
const ALIASES = {};
for (const m of domainTs.matchAll(/export type (\w+)\s*=\s*([^;]+);/g)) {
  ALIASES[m[1]] = m[2].trim();
}
const resolveAlias = (t) => {
  // نرمال‌سازی union (پشتیبانی از | پیش‌انتهایی چندخطی) + باز کردن alias تک‌سطحی
  const out = [];
  const walk = (type, depth = 0) => {
    for (const part of type.split('|').map((p) => p.trim()).filter(Boolean)) {
      if (depth < 3 && ALIASES[part] !== undefined && part !== 'ID' && part !== 'ISODateString') {
        // باز کردن alias (ID و ISODateString به primitive ترجمه می‌شوند)
        walk(ALIASES[part], depth + 1);
      } else if (part === 'ID') {
        out.push('number');
      } else if (part === 'ISODateString') {
        out.push('string');
      } else {
        out.push(part);
      }
    }
  };
  walk(t);
  return out.join(' | ');
};
const ifaceRe = /export interface (\w+) \{([\s\S]*?)\n\}/g;
let im;
while ((im = ifaceRe.exec(domainTs)) !== null) {
  const [, name, body] = im;
  const fields = [];
  for (const line of body.split('\n')) {
    const fm = line.match(/^\s*(\w+)(\?)?:\s*(.+?);?\s*$/);
    if (!fm) continue;
    let type = fm[3].replace(/\/\/.*$/, '').trim().replace(/;$/, '').trim();
    type = resolveAlias(type);
    fields.push({ name: fm[1], optional: !!fm[2], type });
  }
  INTERFACES[name] = fields;
}

// ─── ۳) قوانین نگاشت نوع ───
const TEXT_FIELDS = new Set([
  'body', 'description', 'short_description', 'meta_description', 'address',
  'cancellation_reason', 'reason', 'answer', 'note', 'message', 'payload',
]);
const DECIMAL_FIELDS = new Map([
  ['rating', [5, 2]], ['commission_rate', [5, 2]], ['lat', [10, 7]], ['lng', [10, 7]],
]);
const SMALL_INT_FIELDS = new Set([
  'stock', 'sold_count', 'view_count', 'rating', 'discount_percentage', 'sort_order',
  'quantity', 'max_per_order', 'usage_limit', 'used_count', 'per_user_limit', 'months',
  'priority_level', 'days', 'return_period_days',
]);
const INDEXED_STRINGS = new Set(['slug', 'phone', 'email', 'order_number', 'token', 'code', 'session_id', 'transaction_id', 'authority']);
const STRING_LEN = new Map([['token', 120], ['transaction_id', 120], ['authority', 120], ['ref_number', 60]]);

const isStringLiteralUnion = (t) => /^'[^']*'(\s*\|\s*('[^']*'|null))*$/.test(t) && t.includes("'");

function literalLen(t) {
  const lits = [...t.matchAll(/'([^']*)'/g)].map((m) => m[1].length);
  const max = lits.length ? Math.max(...lits) : 10;
  return Math.min(60, Math.max(20, max + 6));
}

function colLine(f) {
  const raw = f.type.replace(/\s+/g, '');
  const nullable = f.optional || raw.includes('null');
  const n = f.name;

  const isNumeric = (t) => /^number(\||$|\s|\[)/.test(t) || /^ID(\||$|\s)/.test(t);
  if (n === 'id' && isNumeric(raw)) return { line: '            $table->id();' };
  if (/(_at)$/.test(n)) return { ts: n };
  if (DECIMAL_FIELDS.has(n)) {
    const [p, s] = DECIMAL_FIELDS.get(n);
    return { line: `            $table->decimal('${n}', ${p}, ${s})${nullable ? '->nullable()' : ''};` };
  }
  if (raw.includes('boolean')) return { line: `            $table->boolean('${n}')${nullable ? '->nullable()' : ''};` };
  if (raw.includes('number') && (raw.includes('[]') || raw.includes('Record'))) {
    return { line: `            $table->json('${n}')->nullable();` };
  }
  if (raw.startsWith('number[]') || raw.startsWith('ID[]') || isNumeric(raw)) {
    if (/^(number|ID)(\|null)?$/.test(raw)) {
      if (/_id$/.test(n) || n === 'changed_by' || n === 'parent_id') {
        return { line: `            $table->unsignedBigInteger('${n}')${nullable ? '->nullable()' : ''};\n            $table->index('${n}');` };
      }
      const kind = SMALL_INT_FIELDS.has(n) ? 'unsignedInteger' : 'unsignedBigInteger';
      return { line: `            $table->${kind}('${n}')${nullable ? '->nullable()' : ''};` };
    }
    return { line: `            $table->json('${n}')->nullable();` };
  }
  if (raw.includes('boolean') === false && (raw.includes('[]') || raw.includes('Json') || raw.includes('Record') || /^D\./.test(raw) || /^[A-Z]\w+(\|null)?$/.test(raw))) {
    return { line: `            $table->json('${n}')->nullable();` };
  }
  if (isStringLiteralUnion(raw)) {
    const enums = [...raw.matchAll(/'([^']*)'/g)].map((m) => m[1]).join(',');
    return { line: `            $table->string('${n}', ${literalLen(raw)})${nullable ? '->nullable()' : ''}; // enum: ${enums}` };
  }
  if (raw === 'string' || raw === 'string|null') {
    if (TEXT_FIELDS.has(n)) return { line: `            $table->text('${n}')${nullable ? '->nullable()' : ''};` };
    const len = STRING_LEN.get(n) ?? 191;
    const idx = INDEXED_STRINGS.has(n) ? `\n            $table->index('${n}');` : '';
    return { line: `            $table->string('${n}', ${len})${nullable ? '->nullable()' : ''};${idx}` };
  }
  return { line: `            $table->json('${n}')->nullable(); // TODO: ${raw}` };
}

function tableSchema(table, typeName) {
  if (typeName === 'record') {
    return {
      up: [
        '            $table->string(\'key\')->primary();',
        '            $table->text(\'value\')->nullable();',
      ].join('\n'),
      casts: {}, timestamps: false, softDeletes: false,
    };
  }
  const fields = INTERFACES[typeName];
  if (!fields) throw new Error(`interface ${typeName} برای جدول ${table} پیدا نشد`);
  const lines = [];
  const casts = {};
  const tsNames = new Set();
  for (const f of fields) {
    const res = colLine(f);
    if (res.ts) { tsNames.add(res.ts); continue; }
    lines.push(res.line);
  }
  // فیلدهای boolean/json برای casts
  for (const f of fields) {
    const raw = f.type.replace(/\s+/g, '');
    if (raw.includes('boolean')) casts[f.name] = 'boolean';
    else if (raw.includes('[]') || raw.includes('Json') || raw.includes('Record') || (/^D\./.test(raw) && !raw.endsWith('_at'))) casts[f.name] = 'array';
    else if (DECIMAL_FIELDS.has(f.name)) casts[f.name] = `decimal:${DECIMAL_FIELDS.get(f.name)[1]}`;
    else if (/(_at)$/.test(f.name)) casts[f.name] = 'datetime';
  }
  const hasCreated = tsNames.has('created_at');
  const hasUpdated = tsNames.has('updated_at');
  const timestamps = hasCreated && hasUpdated;
  for (const t of tsNames) {
    if (t === 'created_at' && timestamps) continue;
    if (t === 'updated_at' && timestamps) continue;
    if (t === 'deleted_at') continue;
    lines.push(`            $table->timestamp('${t}')->nullable();`);
  }
  if (timestamps) lines.push('            $table->timestamps();');
  if (hasCreated && !hasUpdated) lines.push("            // created_at به‌صورت دستی مدیریت می‌شود");
  const softDeletes = tsNames.has('deleted_at');
  if (softDeletes) lines.push('            $table->softDeletes();');
  return { up: lines.join('\n'), casts, timestamps, softDeletes };
}

// ─── ۴) گروه‌بندی جداول در مهاجرت‌ها ───
const GROUPS = [
  ['core_users', ['users', 'otp_codes', 'personal_access_tokens', 'addresses', 'provinces', 'cities', 'settings']],
  ['catalog', ['categories', 'brands', 'attributes', 'attribute_values', 'colors', 'sizes', 'guarantees', 'shipping_methods']],
  ['products', ['products', 'product_variants', 'product_images', 'product_videos', 'product_attributes', 'product_price_history']],
  ['reviews', ['reviews', 'review_reactions', 'review_images']],
  ['orders', ['carts', 'cart_items', 'orders', 'order_items', 'order_status_history']],
  ['payments', ['payments', 'wallets', 'wallet_transactions']],
  ['discounts', ['coupons', 'special_offers', 'wishlists', 'compare_lists', 'compare_list_items']],
  ['engagement', ['notifications', 'push_subscriptions', 'stock_alerts', 'stock_movements', 'activity_logs']],
  ['cms', ['pages', 'banners', 'sliders', 'menus', 'blog_posts', 'faqs']],
  ['sellers', ['sellers', 'seller_settlements']],
  ['support', ['tickets', 'ticket_messages']],
  ['analytics', ['page_views', 'search_logs', 'product_clicks']],
];

const covered = new Set(GROUPS.flatMap(([, t]) => t));
const leftovers = TABLE_TYPES.map(([t]) => t).filter((t) => !covered.has(t));
if (leftovers.length) GROUPS.push(['misc', leftovers]);

// ─── ۵) تولید فایل‌ها ───
const migDir = path.join(ROOT, 'backend/database/migrations');
const modelDir = path.join(ROOT, 'backend/app/Models');
fs.mkdirSync(migDir, { recursive: true });
fs.mkdirSync(modelDir, { recursive: true });

// مهاجرت‌های پیش‌فرض لاراول: users/cache/jobs — ما خودمان users را می‌سازیم
for (const f of fs.readdirSync(migDir)) {
  if (f.includes('create_users_table')) fs.rmSync(path.join(migDir, f));
}

const typeByTable = Object.fromEntries(TABLE_TYPES);
let count = 0;
GROUPS.forEach(([gname, tables], gi) => {
  const up = [];
  const down = [];
  const creates = [];
  tables.forEach((table, ti) => {
    const type = typeByTable[table];
    if (!type) throw new Error(`جدول ${table} در Database نیست`);
    const sch = tableSchema(table, type);
    creates.push(`        Schema::create('${table}', function (Blueprint $table): void {\n${sch.up}\n        });`);
    down.push(`        Schema::dropIfExists('${table}');`);
    // مدل
    if (type !== 'record') {
      const casts = Object.entries(sch.casts);
      const castBlock = casts.length
        ? `\n    protected $casts = [\n${casts.map(([k, v]) => `        '${k}' => '${v}',`).join('\n')}\n    ];\n`
        : '\n';
      const ts = sch.timestamps ? '' : '\n    public $timestamps = false;\n';
      const sd = sch.softDeletes ? '\n    use SoftDeletes;\n' : '';
      const sdImport = sch.softDeletes ? "use Illuminate\\Database\\Eloquent\\SoftDeletes;\n" : '';
      const model = `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
${sdImport}
class ${type} extends Model
{${sd}
    protected $table = '${table}';

    protected $guarded = [];
${ts}${castBlock}}
`;
      fs.writeFileSync(path.join(modelDir, `${type}.php`), model);
      count++;
    }
  });
  const stamp = `2026_01_01_00${String(gi + 1).padStart(2, '0')}01`;
  const php = `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
${creates.join('\n\n')}
    }

    public function down(): void
    {
${down.join('\n')}
    }
};
`;
  fs.writeFileSync(path.join(migDir, `${stamp}_create_${gname}_tables.php`), php);
});

console.log(`✓ ${GROUPS.length} مهاجرت (${covered.size + leftovers.length} جدول) و ${count} مدل ساخته شد`);
console.log('گروه‌ها:', GROUPS.map(([g, t]) => `${g}(${t.length})`).join(' '));
