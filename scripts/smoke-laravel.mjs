#!/usr/bin/env node
/**
 * تست دود روی بک‌اند لاراول — خود scripts/smoke.mjs را با BASE متناسب اجرا می‌کند.
 *   node scripts/smoke-laravel.mjs            →  http://localhost:8000/api/v1
 *   BASE=http://example/api/v1 node scripts/smoke-laravel.mjs
 */
import { spawnSync } from 'node:child_process';

process.env.BASE ??= process.env.LARAVEL_API_URL
  ? `${process.env.LARAVEL_API_URL.replace(/\/+$/, '')}/api/v1`
  : 'http://localhost:8000/api/v1';

console.log(`[smoke-laravel] BASE=${process.env.BASE}`);
const r = spawnSync(process.execPath, ['scripts/smoke.mjs'], { stdio: 'inherit', env: process.env });
process.exit(r.status ?? 1);
