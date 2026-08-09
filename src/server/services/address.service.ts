import { db, nextId } from '../db';
import { err404, err422 } from '../errors';
import { toAddressDto } from '../resources';
import type * as D from '@/types/domain';

const now = () => new Date().toISOString();

export interface AddressInput {
  title: string;
  province_id: number;
  city_id: number;
  full_address: string;
  postal_code: string;
  receiver_name: string;
  receiver_phone: string;
  lat?: number;
  lng?: number;
  is_default?: boolean;
}

const assertGeo = (provinceId: number, cityId: number) => {
  const city = db.cities.find((c) => c.id === cityId);
  if (!city || city.province_id !== provinceId) {
    throw err422({ city_id: ['شهر انتخاب شده با استان هم‌خوانی ندارد'] });
  }
};

export const listAddresses = (user: D.User) =>
  db.addresses.filter((a) => a.user_id === user.id).map(toAddressDto);

export function createAddress(user: D.User, input: AddressInput) {
  assertGeo(input.province_id, input.city_id);
  const isFirst = !db.addresses.some((a) => a.user_id === user.id);
  const address: D.Address = {
    id: nextId(db.addresses), user_id: user.id,
    title: input.title, province_id: input.province_id, city_id: input.city_id,
    full_address: input.full_address, postal_code: input.postal_code,
    lat: input.lat ?? null, lng: input.lng ?? null,
    receiver_name: input.receiver_name, receiver_phone: input.receiver_phone,
    is_default: input.is_default ?? isFirst,
    created_at: now(), updated_at: now(),
  };
  if (address.is_default) {
    db.addresses.forEach((a) => { if (a.user_id === user.id) a.is_default = false; });
  }
  db.addresses.push(address);
  return toAddressDto(address);
}

const findMine = (user: D.User, id: number): D.Address => {
  const address = db.addresses.find((a) => a.id === id && a.user_id === user.id);
  if (!address) throw err404('آدرس مورد نظر یافت نشد');
  return address;
};

export function updateAddress(user: D.User, id: number, input: Partial<AddressInput>) {
  const address = findMine(user, id);
  if (input.city_id != null || input.province_id != null) {
    assertGeo(input.province_id ?? address.province_id, input.city_id ?? address.city_id);
  }
  if (input.is_default) {
    db.addresses.forEach((a) => { if (a.user_id === user.id) a.is_default = false; });
  }
  Object.assign(address, {
    title: input.title ?? address.title,
    province_id: input.province_id ?? address.province_id,
    city_id: input.city_id ?? address.city_id,
    full_address: input.full_address ?? address.full_address,
    postal_code: input.postal_code ?? address.postal_code,
    receiver_name: input.receiver_name ?? address.receiver_name,
    receiver_phone: input.receiver_phone ?? address.receiver_phone,
    lat: input.lat ?? address.lat,
    lng: input.lng ?? address.lng,
    is_default: input.is_default ?? address.is_default,
    updated_at: now(),
  });
  return toAddressDto(address);
}

export function deleteAddress(user: D.User, id: number) {
  const address = findMine(user, id);
  const usedInOpenOrder = db.orders.some(
    (o) => o.address_id === id && ['pending', 'processing', 'shipped'].includes(o.status),
  );
  if (usedInOpenOrder) throw err422({ address: ['این آدرس در یک سفارش فعال استفاده شده است'] });
  db.addresses = db.addresses.filter((a) => a.id !== id);
  if (address.is_default) {
    const next = db.addresses.find((a) => a.user_id === user.id);
    if (next) next.is_default = true;
  }
}

export function setDefaultAddress(user: D.User, id: number) {
  const address = findMine(user, id);
  db.addresses.forEach((a) => { if (a.user_id === user.id) a.is_default = false; });
  address.is_default = true;
  address.updated_at = now();
  return toAddressDto(address);
}
