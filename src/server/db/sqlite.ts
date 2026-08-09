/**
 * ─── لایه ماندگاری SQLite (دیتابیس واقعی) ───
 * تمام کالکشن‌های سیستم (کالاها، سفارش‌ها، کاربران، سبد، کوپن‌ها…) روی یک فایل
 * SQLite واقعی روی دیسک ذخیره می‌شود؛ دیگر داده‌ها با ری‌استارت پاک نمی‌شوند.
 *
 * رفتار:
 *  - بوت: اگر فایل دیتابیس سید شده باشد همان بارگذاری می‌شود؛ وگرنه سید اولیه
 *    (همان داده‌های نمایشی فعلی) اجرا و بلافاصله روی دیسک نوشته می‌شود.
 *  - زمان اجرا: بعد از هر درخواست موفق API، وضعیت کامل دیتابیس در یک تراکنش
 *    اتمیک روی دیسک فلاش می‌شود (write-through). حافظه نقش کش دارد و SQLite
 *    منبع حقیقت (source of truth) ماندگار است.
 *
 *  نام جداول دقیقاً با نام کالکشن‌ها (معادل جداول لاراول) یکی است تا در فاز
 *  انتقال به لاراول/MySQL، اسکیما و داده یک‌به‌یک قابل انتقال باشد.
 *
 *  مسیر فایل: data/ginankala.sqlite (قابل تغییر با GNK_SQLITE_PATH)
 */
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import type { Database } from './index';

const SQLITE_GLOBAL_KEY = '__GNK_SQLITE_V1__';

function resolveDbPath(): string {
  if (process.env.GNK_SQLITE_PATH) return process.env.GNK_SQLITE_PATH;
  const dir = path.join(process.cwd(), 'data');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return path.join(dir, 'ginankala.sqlite');
}

function columnTables(conn: DatabaseSync): void {
  conn.exec('CREATE TABLE IF NOT EXISTS _meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)');
  conn.exec('CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)');
}

function ensureCollection(conn: DatabaseSync, name: string): void {
  conn.exec(`CREATE TABLE IF NOT EXISTS "${name}" (id INTEGER PRIMARY KEY, doc TEXT NOT NULL)`);
}

function open(): DatabaseSync {
  const g = globalThis as unknown as Record<string, DatabaseSync | undefined>;
  if (!g[SQLITE_GLOBAL_KEY]) {
    const conn = new DatabaseSync(resolveDbPath());
    conn.exec('PRAGMA journal_mode = WAL');
    conn.exec('PRAGMA synchronous = NORMAL');
    conn.exec('PRAGMA busy_timeout = 3000');
    columnTables(conn);
    g[SQLITE_GLOBAL_KEY] = conn;
  }
  return g[SQLITE_GLOBAL_KEY]!;
}

const collectionEntries = (db: Database) =>
  (Object.entries(db) as Array<[string, unknown]>).filter(([, v]) => Array.isArray(v)) as Array<[string, Array<unknown>]>;

/**
 * بارگذاری دیتابیس از روی دیسک داخل «تمپلیت» (آبجکت تازه‌ساخته‌شده از سید).
 * اگر دیتابیس هنوز سید نشده باشد null برمی‌گردد.
 */
export function loadFromSqlite(template: Database): Database | null {
  const conn = open();
  for (const [name] of collectionEntries(template)) ensureCollection(conn, name);

  const usersRow = conn.prepare('SELECT COUNT(*) AS c FROM users').get() as { c: number } | undefined;
  if (!usersRow || usersRow.c === 0) return null;

  try {
    for (const [name] of collectionEntries(template)) {
      const rows = conn.prepare(`SELECT doc FROM "${name}" ORDER BY id`).all() as Array<{ doc: string }>;
      (template as unknown as Record<string, unknown>)[name] = rows.map((r) => JSON.parse(r.doc));
    }
    const settings: Record<string, string> = {};
    for (const r of conn.prepare('SELECT key, value FROM settings').all() as Array<{ key: string; value: string }>) {
      settings[r.key] = r.value;
    }
    template.settings = settings;
    return template;
  } catch (e) {
    console.error('[DB] load from sqlite failed — reseeding', e);
    return null;
  }
}

/** ذخیره اتمیک کل وضعیت دیتابیس روی دیسک */
export function persistToSqlite(db: Database): void {
  const conn = open();
  conn.exec('BEGIN');
  try {
  for (const [name, rows] of collectionEntries(db)) {
      ensureCollection(conn, name);
      conn.exec(`DELETE FROM "${name}"`);
      if (rows.length) {
        // کلید اصلی = ترتیب درج آرایه (id کسب‌وکار داخل JSON است)؛ با این روش
        // هیچ‌وقت برخورد UNIQUE رخ نمی‌دهد حتی اگر سرویس‌ها id تکراری ساخته باشند
        const stmt = conn.prepare(`INSERT INTO "${name}" (id, doc) VALUES (?, ?)`);
        rows.forEach((row, i) => stmt.run(i + 1, JSON.stringify(row)));
      }
    }
    conn.exec('DELETE FROM settings');
    const sStmt = conn.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
    for (const [k, v] of Object.entries(db.settings ?? {})) sStmt.run(k, String(v));
    conn
      .prepare('INSERT INTO _meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
      .run('persisted_at', new Date().toISOString());
    conn.exec('COMMIT');
  } catch (e) {
    conn.exec('ROLLBACK');
    throw e;
  }
}

/** مسیر فایل دیتابیس (برای لاگ/دیباگ) */
export function sqlitePath(): string {
  return resolveDbPath();
}
