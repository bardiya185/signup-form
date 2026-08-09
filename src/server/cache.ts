/**
 * کش درون‌حافظه‌ای با Tag — معادل Redis Cache Tags لاراول.
 * use: remember('categories:tree', 300, ['categories'], () => buildTree())
 */

interface Entry { value: unknown; expiresAt: number; tags: string[] }
const store = new Map<string, Entry>();

export function remember<T>(key: string, ttlSec: number, tags: string[], fn: () => T): T {
  const now = Date.now();
  const hit = store.get(key);
  if (hit && hit.expiresAt > now) return hit.value as T;
  const value = fn();
  store.set(key, { value, expiresAt: now + ttlSec * 1000, tags });
  return value;
}

export function forget(key: string): void {
  store.delete(key);
}

/** ابطال بر اساس تگ — معادل Cache::tags(['categories'])->flush() */
export function flushTag(tag: string): void {
  for (const [key, entry] of store) {
    if (entry.tags.includes(tag)) store.delete(key);
  }
}

export function cacheStats(): { keys: number; size: number } {
  return { keys: store.size, size: JSON.stringify([...store.keys()]).length };
}
