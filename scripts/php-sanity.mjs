/**
 * بررسی ایستای فایل‌های PHP (بدون رن‌تایم PHP):
 *  - تگ <?php و namespace/class متناسب با مسیر
 *  - توازن (), {}, [] با نادیده‌گرفتن رشته‌ها و کامنت‌ها (ماشین حالت)
 *  - باقی‌ماندن TODO/نشانه‌های ناقص
 * اجرا: node scripts/php-sanity.mjs
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const ROOT = 'backend';
const files = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) {
      if (name !== 'vendor' && name !== 'node_modules') walk(full);
    } else if (name.endsWith('.php')) files.push(full);
  }
};
walk(path.join(ROOT, 'app'));
walk(path.join(ROOT, 'routes'));
walk(path.join(ROOT, 'database/migrations'));
walk(path.join(ROOT, 'database/seeders'));
walk(path.join(ROOT, 'bootstrap'));

let failures = 0;
const fail = (file, msg) => { failures++; console.log(`✗ ${file}: ${msg}`); };

for (const file of files) {
  const src = readFileSync(file, 'utf8');
  if (!src.startsWith('<?php')) fail(file, 'missing <?php tag');
  if (file.startsWith(`${ROOT}/app/`) && !src.includes('namespace App\\')) fail(file, 'missing namespace');
  if (/TODO|FIXME|XXX(?!['"])/.test(src)) fail(file, 'TODO marker found');

  // ماشین حالت: رشته/کامنت نادیده گرفته می‌شود
  let state = 'normal';
  const stack = [];
  let line = 1;
  let error = null;
  for (let i = 0; i < src.length && !error; i++) {
    const ch = src[i];
    const next = src[i + 1] ?? '';
    if (ch === '\n') line++;
    switch (state) {
      case 'single':
        if (ch === '\\') i++;
        else if (ch === "'") state = 'normal';
        break;
      case 'double':
        if (ch === '\\') i++;
        else if (ch === '"') state = 'normal';
        break;
      case 'line_comment':
        if (ch === '\n') state = 'normal';
        break;
      case 'block_comment':
        if (ch === '*' && next === '/') { state = 'normal'; i++; }
        break;
      default:
        if (ch === "'") state = 'single';
        else if (ch === '"') state = 'double';
        else if (ch === '/' && next === '/') state = 'line_comment';
        else if (ch === '#') state = 'line_comment';
        else if (ch === '/' && next === '*') { state = 'block_comment'; i++; }
        else if (ch === '(' || ch === '[' || ch === '{') stack.push({ ch, line });
        else if (ch === ')' || ch === ']' || ch === '}') {
          const top = stack.pop();
          const want = ch === ')' ? '(' : ch === ']' ? '[' : '{';
          if (!top || top.ch !== want) error = `unbalanced '${ch}' at line ${line}`;
        }
    }
  }
  if (!error && state !== 'normal' && state !== 'line_comment') error = `unterminated ${state}`;
  if (!error && stack.length) error = `unclosed '${stack[stack.length - 1].ch}' from line ${stack[stack.length - 1].line}`;
  if (error) fail(file, error);
}

// تطابق namespace/class با مسیر (PSR-4) برای app/
for (const file of files.filter((f) => f.startsWith(`${ROOT}/app/`))) {
  const src = readFileSync(file, 'utf8');
  const ns = src.match(/namespace ([\w\\]+);/)?.[1];
  const cls = src.match(/(?:^|\n)\s*(?:final\s+|abstract\s+)?class (\w+)/)?.[1];
  const rel = file.replace(`${ROOT}/app/`, '').replace('.php', '');
  const expectNs = 'App\\' + rel.split('/').slice(0, -1).join('\\');
  if (ns && ns !== expectNs) fail(file, `namespace '${ns}' != expected '${expectNs}'`);
  if (cls && cls !== rel.split('/').pop()) fail(file, `class '${cls}' != file name '${rel.split('/').pop()}'`);
}

console.log(failures === 0 ? `✓ php sanity OK — ${files.length} files` : `✗ ${failures} problem(s)`);
process.exit(failures === 0 ? 0 : 1);
