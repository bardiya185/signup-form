#!/usr/bin/env node
/**
 * Export دیتابیس SQLite فعلی (data/ginankala.sqlite) به JSON های خام سازگار با سیدر لاراول
 * خروجی: backend/database/seeders/data/<table>.json
 *   - مقادیر object/array به JSON-string تبدیل می‌شوند (برای ستون‌های json)
 *   - boolean → 0/1 ، سایر مقادیر دست‌نخورده می‌مانند (تبدیل datetime در DatabaseSeeder)
 * اجرا: node scripts/export-seed-json.mjs
 */
import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';

const ROOT = path.resolve(import.meta.dirname, '..');
const DB_PATH = path.join(ROOT, 'data/ginankala.sqlite');
const OUT = path.join(ROOT, 'backend/database/seeders/data');
if (!fs.existsSync(DB_PATH)) throw new Error('data/ginankala.sqlite پیدا نشد — اول سرور Next را یک بار اجرا کنید');

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const db = new DatabaseSync(DB_PATH, { readonly: true });
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name != '_meta'")
  .all().map((r) => r.name);

let totalRows = 0;
for (const table of tables) {
  let rows;
  if (table === 'settings') {
    rows = db.prepare('SELECT key, value FROM settings').all().map((r) => ({ key: r.key, value: r.value }));
  } else {
    rows = db.prepare(`SELECT doc FROM "${table}" ORDER BY id`).all().map((r) => JSON.parse(r.doc));
  }
  const normalized = rows.map((row) => {
    const out = {};
    for (const [k, v] of Object.entries(row)) {
      if (v === null || v === undefined) out[k] = null;
      else if (typeof v === 'boolean') out[k] = v ? 1 : 0;
      else if (typeof v === 'object') out[k] = JSON.stringify(v);
      else out[k] = v;
    }
    return out;
  });
  fs.writeFileSync(path.join(OUT, `${table}.json`), JSON.stringify(normalized, null, 1));
  totalRows += normalized.length;
  console.log(`${table}: ${normalized.length}`);
}
console.log(`✓ ${tables.length} جدول، ${totalRows} ردیف در backend/database/seeders/data نوشته شد`);
