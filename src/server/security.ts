import crypto from 'node:crypto';

/**
 * امنیت دمو — در پروداکشن لاراول با bcrypt/argon2 جایگزین می‌شود.
 * ساختار رابط یکسان است تا رفتار API تغییر نکند.
 */
const SALT = process.env.GNK_HASH_SALT ?? 'gnk-demo-salt-2026';

export const hashPassword = (plain: string): string =>
  crypto.createHash('sha256').update(`${SALT}:${plain}`).digest('hex');

export const checkPassword = (plain: string, hashed: string): boolean => {
  const a = Buffer.from(hashPassword(plain));
  const b = Buffer.from(hashed);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

export const randomToken = (): string => crypto.randomBytes(32).toString('hex');

export const randomDigits = (length: number): string =>
  Array.from(crypto.randomInt(0, 10 ** length).toString().padStart(length, '0')).slice(-length).join('');

export const randomRefNumber = (): string => String(crypto.randomInt(10 ** 11, 10 ** 12 - 1));
