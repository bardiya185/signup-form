import '../listeners';
import { db, nextId } from '../db';
import { apiError, err422 } from '../errors';
import { checkPassword, hashPassword, randomDigits } from '../security';
import { issueToken, notify, revokeToken, toUserDto } from '../resources';
import { emit, EVT } from '../events';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type * as D from '@/types/domain';

const now = () => new Date().toISOString();

export type UserDto = ReturnType<typeof toUserDto>;
export interface AuthResult {
  user: UserDto;
  token: string;
  tokenType: 'Bearer';
  firstLogin?: boolean;
}

const findByIdentity = (identity: string): D.User | undefined => {
  const id = identity.trim().toLowerCase();
  return db.users.find(
    (u) => (u.phone === identity.trim() || u.email?.toLowerCase() === id) && !u.deleted_at,
  );
};

const createWallet = (userId: number) => {
  db.wallets.push({ id: nextId(db.wallets), user_id: userId, balance: 0, created_at: now(), updated_at: now() });
};

const toAuthResult = (user: D.User, firstLogin = false): AuthResult => ({
  user: toUserDto(user),
  token: issueToken(user.id),
  tokenType: 'Bearer',
  firstLogin,
});

// ─── ثبت‌نام ───
export function register(input: {
  first_name: string; last_name: string; phone: string;
  email?: string; password: string;
}): AuthResult {
  if (db.users.some((u) => u.phone === input.phone)) {
    throw err422({ phone: ['این شماره موبایل قبلاً ثبت شده است'] });
  }
  if (input.email && db.users.some((u) => u.email?.toLowerCase() === input.email!.toLowerCase())) {
    throw err422({ email: ['این ایمیل قبلاً ثبت شده است'] });
  }
  const user: D.User = {
    id: nextId(db.users),
    first_name: input.first_name, last_name: input.last_name,
    email: input.email ?? null, phone: input.phone,
    password: hashPassword(input.password),
    national_code: null, avatar: null, birth_date: null, gender: null,
    email_verified_at: null, phone_verified_at: now(),
    status: 'active', role: 'customer', remember_token: null,
    created_at: now(), updated_at: now(), deleted_at: null,
  };
  db.users.push(user);
  createWallet(user.id);
  emit(EVT.UserRegistered, { userId: user.id, name: user.first_name });
  return toAuthResult(user, true);
}

// ─── ورود با رمز عبور ───
export function login(identity: string, password: string): AuthResult {
  const user = findByIdentity(identity);
  if (!user || !checkPassword(password, user.password)) {
    throw apiError(401, 'اطلاعات ورود صحیح نیست');
  }
  if (user.status === 'banned') throw apiError(403, 'حساب شما مسدود شده است؛ با پشتیبانی تماس بگیرید');
  user.phone_verified_at ??= now();
  return toAuthResult(user);
}

// ─── OTP ───
export function sendOtp(phone: string, purpose: 'login' | 'reset' = 'login') {
  const user = db.users.find((u) => u.phone === phone && !u.deleted_at);
  if (purpose === 'reset' && !user) throw err422({ identity: ['کاربری با این مشخصات یافت نشد'] });

  // باطل‌سازی کدهای قبلی
  db.otp_codes.forEach((o) => {
    if (o.phone === phone && !o.used_at) o.used_at = now();
  });

  const code = randomDigits(5);
  db.otp_codes.push({
    id: nextId(db.otp_codes), phone, code,
    expired_at: new Date(Date.now() + 120_000).toISOString(),
    used_at: null, created_at: now(), updated_at: now(),
  });
  // در پروداکشن: SendSMS Job با کاوه‌نگار/قاصدک
  console.log(`[OTP SMS → ${phone}] کد تایید: ${code}`);
  return { devCode: code, expiresIn: 120, channel: 'sms' };
}

const consumeOtp = (phone: string, code: string) => {
  const otp = [...db.otp_codes].reverse().find((o) => o.phone === phone && !o.used_at);
  if (!otp || otp.code !== code) throw err422({ code: ['کد تایید وارد شده صحیح نیست'] });
  if (new Date(otp.expired_at) < new Date()) throw err422({ code: ['کد تایید منقضی شده است؛ دوباره درخواست دهید'] });
  otp.used_at = now();
};

export function verifyOtp(phone: string, code: string): AuthResult {
  consumeOtp(phone, code);
  let user = db.users.find((u) => u.phone === phone && !u.deleted_at);
  if (user) {
    if (user.status === 'banned') throw apiError(403, 'حساب شما مسدود شده است');
    user.phone_verified_at ??= now();
    return toAuthResult(user);
  }
  // ورود خودکار = ثبت‌نام (سبک دیجی‌کالا)
  const createdUser: D.User = {
    id: nextId(db.users), first_name: 'کاربر', last_name: 'گینان‌کالا',
    email: null, phone, password: hashPassword(randomDigits(10)),
    national_code: null, avatar: null, birth_date: null, gender: null,
    email_verified_at: null, phone_verified_at: now(),
    status: 'active', role: 'customer', remember_token: null,
    created_at: now(), updated_at: now(), deleted_at: null,
  };
  db.users.push(createdUser);
  createWallet(createdUser.id);
  emit(EVT.UserRegistered, { userId: createdUser.id, name: createdUser.first_name });
  return toAuthResult(createdUser, true);
}

// ─── فراموشی رمز ───
export function forgotPassword(identity: string) {
  const user = findByIdentity(identity);
  if (!user) throw err422({ identity: ['کاربری با این مشخصات یافت نشد'] });
  return sendOtp(user.phone, 'reset');
}

export function resetPassword(identity: string, code: string, password: string) {
  const user = findByIdentity(identity);
  if (!user) throw err422({ identity: ['کاربری با این مشخصات یافت نشد'] });
  consumeOtp(user.phone, code);
  user.password = hashPassword(password);
  user.updated_at = now();
  db.personal_access_tokens.forEach((t) => {
    if (t.user_id === user.id && !t.revoked_at) t.revoked_at = now();
  });
}

// ─── پروفایل ───
export function updateProfile(user: D.User, patch: Partial<Pick<D.User,
  'first_name' | 'last_name' | 'email' | 'national_code' | 'birth_date' | 'gender'>>) {
  if (patch.email) {
    const clash = db.users.find((u) => u.id !== user.id && u.email?.toLowerCase() === patch.email!.toLowerCase());
    if (clash) throw err422({ email: ['این ایمیل توسط کاربر دیگری استفاده شده است'] });
    if (patch.email !== user.email) user.email_verified_at = null;
  }
  Object.assign(user, { ...patch, updated_at: now() });
  return toUserDto(user);
}

export function changePassword(user: D.User, currentPassword: string, newPassword: string) {
  if (!checkPassword(currentPassword, user.password)) {
    throw err422({ current_password: ['رمز عبور فعلی صحیح نیست'] });
  }
  user.password = hashPassword(newPassword);
  user.updated_at = now();
  notify(user.id, 'system', 'رمز عبور تغییر کرد', 'رمز عبور حساب شما با موفقیت تغییر یافت.');
}

export function setAvatar(user: D.User, payload: string) {
  const mimeMap: Record<string, string> = {
    'data:image/png': 'png', 'data:image/jpeg': 'jpg', 'data:image/webp': 'webp',
  };
  const matched = Object.entries(mimeMap).find(([mime]) => payload.startsWith(mime));
  if (matched) {
    const base64 = payload.split(',')[1];
    if (!base64) throw err422({ avatar: ['فایل تصویر معتبر نیست'] });
    if (base64.length > 3_000_000) throw err422({ avatar: ['حجم تصویر نباید بیش از ۲ مگابایت باشد'] });
    const dir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
    mkdirSync(dir, { recursive: true });
    const file = `${user.id}.${matched[1]}`;
    writeFileSync(path.join(dir, file), Buffer.from(base64, 'base64'));
    user.avatar = `/uploads/avatars/${file}?v=${Date.now()}`;
  } else if (payload.startsWith('/')) {
    user.avatar = payload;
  } else {
    throw err422({ avatar: ['فرمت تصویر معتبر نیست'] });
  }
  user.updated_at = now();
  return toUserDto(user);
}

export function logout(rawToken: string | null) {
  if (rawToken) revokeToken(rawToken);
}
