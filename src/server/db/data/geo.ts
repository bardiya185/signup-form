import type { City, Province } from '@/types/domain';

export const provinces: Province[] = [
  { id: 1, name: 'تهران', slug: 'tehran' },
  { id: 2, name: 'البرز', slug: 'alborz' },
  { id: 3, name: 'اصفهان', slug: 'isfahan' },
  { id: 4, name: 'خراسان رضوی', slug: 'khorasan-razavi' },
  { id: 5, name: 'فارس', slug: 'fars' },
  { id: 6, name: 'آذربایجان شرقی', slug: 'east-azerbaijan' },
  { id: 7, name: 'گیلان', slug: 'gilan' },
  { id: 8, name: 'قم', slug: 'qom' },
];

export const cities: City[] = [
  { id: 1, province_id: 1, name: 'تهران', slug: 'tehran' },
  { id: 2, province_id: 1, name: 'ری', slug: 'rey' },
  { id: 3, province_id: 1, name: 'اسلامشهر', slug: 'eslamshahr' },
  { id: 4, province_id: 2, name: 'کرج', slug: 'karaj' },
  { id: 5, province_id: 2, name: 'فردیس', slug: 'fardis' },
  { id: 6, province_id: 3, name: 'اصفهان', slug: 'isfahan' },
  { id: 7, province_id: 3, name: 'کاشان', slug: 'kashan' },
  { id: 8, province_id: 4, name: 'مشهد', slug: 'mashhad' },
  { id: 9, province_id: 4, name: 'نیشابور', slug: 'neyshabur' },
  { id: 10, province_id: 5, name: 'شیراز', slug: 'shiraz' },
  { id: 11, province_id: 5, name: 'مرودشت', slug: 'marvdasht' },
  { id: 12, province_id: 6, name: 'تبریز', slug: 'tabriz' },
  { id: 13, province_id: 6, name: 'مراغه', slug: 'maragheh' },
  { id: 14, province_id: 7, name: 'رشت', slug: 'rasht' },
  { id: 15, province_id: 7, name: 'بندر انزلی', slug: 'bandar-anzali' },
  { id: 16, province_id: 8, name: 'قم', slug: 'qom' },
];
