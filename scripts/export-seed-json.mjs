/**
 * خروجی کامل دیتابیس واقعی (SQLite) به فایل‌های JSON برای Seeder لاراول
 * خروجی: backend/database/seeders/data/<table>.json — آماده DB::table()->insert()
 * اجرا: node scripts/export-seed-json.mjs
 */
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, writeFileSync } from 'node:fs';

const OUT = 'backend/database/seeders/data';
mkdirSync(OUT, { recursive: true });

const db = new DatabaseSync('data/ginankala.sqlite');
const tables = db
  .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name != '_meta' ORDER BY name")
  .all()
  .map((r) => r.name);

// فیلدهایی که به‌صورت JSON ذخیره می‌شوند (در سیدر خام insert می‌شوند)
const encodeRow = (row) =>
  Object.fromEntries(
    Object.entries(row).map(([k, v]) => [k, v !== null && typeof v === 'object' ? JSON.stringify(v) : v]),
  );

let total = 0;
for (const t of tables) {
  const rows =
    t === 'settings'
      ? db.prepare('SELECT key, value FROM settings ORDER BY key').all()
      : db.prepare(`SELECT doc FROM "${t}" ORDER BY id`).all().map((r) => JSON.parse(r.doc));
  writeFileSync(`${OUT}/${t}.json`, JSON.stringify(rows.map(encodeRow), null, 1) + '\n');
  total += rows.length;
  console.log(`${t}: ${rows.length}`);
}
console.log(`✓ exported ${tables.length} tables / ${total} rows → ${OUT}/`);
