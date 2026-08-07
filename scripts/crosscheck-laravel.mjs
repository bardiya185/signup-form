#!/usr/bin/env node
/**
 * چک متقاطع استاتیک بک‌اند لاراول (بدون PHP):
 *  ۱) هر [Controller::class,'method'] در routes/api.php → فایل+متد موجود باشد
 *  ۲) FormRequest های use شده در کنترلرها موجود باشند
 *  ۳) فراخوانی‌های Service::method و Dto::method موجود باشند
 * اجرا: node scripts/crosscheck-laravel.mjs
 */
import fs from 'fs';

const routes = fs.readFileSync('backend/routes/api.php', 'utf8');
const useMap = {};
for (const m of routes.matchAll(/use (App\\[\w\\]+);/g)) useMap[m[1].split('\\').pop()] = m[1];

const missing = [];
const refs = new Set();
for (const m of routes.matchAll(/\[(\w+)::class,\s*'(\w+)'\]/g)) refs.add(`${m[1]}@${m[2]}`);

const read = (p) => (fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '');
const hasFn = (src, fn) => new RegExp(`function ${fn}\\s*\\(`).test(src);

for (const ref of refs) {
  const [cls, method] = ref.split('@');
  const fqcn = useMap[cls];
  if (!fqcn) { missing.push(`${ref} → import نشده`); continue; }
  const p = `backend/app/${fqcn.replace('App\\', '').split('\\').join('/')}.php`;
  if (!hasFn(read(p), method)) missing.push(`${ref} → متد/فایل (${p})`);
}

const services = ['AdminService', 'AdminCatalogService', 'SellerService', 'WarehouseService',
  'OrderService', 'CartService', 'AuthService', 'PaymentService'];
const dtoSrc = read('backend/app/Support/Dto.php');

const phpFiles = [];
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) =>
  e.isDirectory() ? walk(`${d}/${e.name}`) : e.name.endsWith('.php') && phpFiles.push(`${d}/${e.name}`));
walk('backend/app/Http/Controllers');
walk('backend/app/Services');

for (const f of phpFiles) {
  const src = read(f);
  for (const m of src.matchAll(/use App\\Http\\Requests\\(\w+);/g)) {
    if (!fs.existsSync(`backend/app/Http/Requests/${m[1]}.php`)) missing.push(`${f}: Request ${m[1]}`);
  }
  for (const m of src.matchAll(/(\w+)::(\w+)\(/g)) {
    const [, svc, meth] = m;
    if (services.includes(svc)) {
      if (!hasFn(read(`backend/app/Services/${svc}.php`), meth)) missing.push(`${f}: ${svc}::${meth}`);
    }
    if (svc === 'Dto' && !hasFn(dtoSrc, meth)) missing.push(`${f}: Dto::${meth}`);
  }
}

const uniq = [...new Set(missing)];
console.log(uniq.length ? `❌ MISSING (${uniq.length}):\n${uniq.join('\n')}` : `✓ cross-check OK — ${refs.size} route refs`);
process.exit(uniq.length ? 1 : 0);
