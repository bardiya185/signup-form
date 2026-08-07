import type { Address, Seller, User, Wallet } from '@/types/domain';
import { hashPassword } from '@/server/security';

// ─── کاربران (رمز همه کاربران دمو: 123456) ───
export const users: User[] = [
  {
    id: 1, first_name: 'مدیر', last_name: 'سیستم', email: 'admin@ginankala.ir',
    phone: '09120000001', password: hashPassword('123456'), national_code: null,
    avatar: null, birth_date: null, gender: null,
    email_verified_at: '2026-01-01T00:00:00Z', phone_verified_at: '2026-01-01T00:00:00Z',
    status: 'active', role: 'super_admin', remember_token: null,
    created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z', deleted_at: null,
  },
  {
    id: 2, first_name: 'سارا', last_name: 'محمدی', email: 'sara@example.com',
    phone: '09120000002', password: hashPassword('123456'), national_code: '0012345678',
    avatar: null, birth_date: '1994-05-12', gender: 'female',
    email_verified_at: '2026-02-10T08:00:00Z', phone_verified_at: '2026-02-10T08:00:00Z',
    status: 'active', role: 'customer', remember_token: null,
    created_at: '2026-02-10T08:00:00Z', updated_at: '2026-02-10T08:00:00Z', deleted_at: null,
  },
  {
    id: 3, first_name: 'علی', last_name: 'رضایی', email: 'ali@example.com',
    phone: '09120000003', password: hashPassword('123456'), national_code: null,
    avatar: null, birth_date: null, gender: 'male',
    email_verified_at: null, phone_verified_at: '2026-03-01T10:00:00Z',
    status: 'active', role: 'seller', remember_token: null,
    created_at: '2026-03-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z', deleted_at: null,
  },
];

export const addresses: Address[] = [
  {
    id: 1, user_id: 2, title: 'منزل', province_id: 1, city_id: 1,
    full_address: 'تهران، خیابان ولیعصر، بالاتر از پارک ساعی، کوچه بهار، پلاک ۱۲، واحد ۳',
    postal_code: '1511716513', lat: 35.7448, lng: 51.4082,
    receiver_name: 'سارا محمدی', receiver_phone: '09120000002', is_default: true,
    created_at: '2026-02-10T08:30:00Z', updated_at: '2026-02-10T08:30:00Z',
  },
  {
    id: 2, user_id: 2, title: 'محل کار', province_id: 1, city_id: 1,
    full_address: 'تهران، خیابان مطهری، نبش میرسلیمانی، ساختمان آریا، طبقه ۴',
    postal_code: '1587654321', lat: 35.7247, lng: 51.4253,
    receiver_name: 'سارا محمدی', receiver_phone: '09120000002', is_default: false,
    created_at: '2026-04-01T09:00:00Z', updated_at: '2026-04-01T09:00:00Z',
  },
];

export const wallets: Wallet[] = [
  { id: 1, user_id: 2, balance: 250000, created_at: '', updated_at: '' },
  { id: 2, user_id: 3, balance: 0, created_at: '', updated_at: '' },
];

// ─── فروشندگان (مارکت‌پلیس) ───
const seller = (
  id: number, user_id: number, shop_name: string, slug: string,
  rating: number, commission_rate: number, province_id: number, city_id: number,
): Seller => ({
  id, user_id, shop_name, slug, logo: null,
  description: `فروشگاه تایید شده ${shop_name}`,
  national_id: `1400${id}8822`, phone: '02191001100', email: `seller${id}@ginankala.ir`,
  province_id, city_id, address: 'تهران', shaba_number: `IR0601200000000012345${id}8901`,
  commission_rate, status: 'approved', rating,
  created_at: '2026-01-15T00:00:00Z', updated_at: '2026-01-15T00:00:00Z',
});

export const sellers: Seller[] = [
  seller(1, 1, 'گینان‌کالا', 'ginankala', 4.9, 0, 1, 1),
  seller(2, 3, 'دنیای دیجیتال پارس', 'pars-digital', 4.5, 8, 1, 1),
  seller(3, 1, 'مد شیک‌پوشان', 'shikpushan', 4.3, 10, 3, 6),
  seller(4, 1, 'بازار بزرگ تهران', 'bozorg-bazar', 4.6, 7, 1, 1),
];
