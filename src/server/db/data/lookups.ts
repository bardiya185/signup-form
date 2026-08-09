import type { Attribute, AttributeValue, Color, Guarantee, Size } from '@/types/domain';

// ─── رنگ‌ها ───
export const colors: Color[] = [
  { id: 1, name: 'مشکی', hex_code: '#212121', created_at: '', updated_at: '' },
  { id: 2, name: 'سفید', hex_code: '#f5f5f5', created_at: '', updated_at: '' },
  { id: 3, name: 'نقره‌ای', hex_code: '#c0c0c0', created_at: '', updated_at: '' },
  { id: 4, name: 'خاکستری', hex_code: '#6b7280', created_at: '', updated_at: '' },
  { id: 5, name: 'آبی', hex_code: '#3b82f6', created_at: '', updated_at: '' },
  { id: 6, name: 'قرمز', hex_code: '#dc2626', created_at: '', updated_at: '' },
  { id: 7, name: 'سبز', hex_code: '#16a34a', created_at: '', updated_at: '' },
  { id: 8, name: 'قهوه‌ای', hex_code: '#7c5a46', created_at: '', updated_at: '' },
  { id: 9, name: 'کرم', hex_code: '#e7d7c1', created_at: '', updated_at: '' },
  { id: 10, name: 'صورتی', hex_code: '#ff80c0', created_at: '', updated_at: '' },
  { id: 11, name: 'بنفش', hex_code: '#8b5cf6', created_at: '', updated_at: '' },
  { id: 12, name: 'طلایی', hex_code: '#d4af37', created_at: '', updated_at: '' },
  { id: 13, name: 'تیتانیوم طبیعی', hex_code: '#a69c90', created_at: '', updated_at: '' },
];

// ─── سایزها ───
export const sizes: Size[] = [
  { id: 1, name: 'فری سایز', type: 'other', created_at: '', updated_at: '' },
  { id: 2, name: '41', type: 'shoe', created_at: '', updated_at: '' },
  { id: 3, name: '42', type: 'shoe', created_at: '', updated_at: '' },
  { id: 4, name: '43', type: 'shoe', created_at: '', updated_at: '' },
  { id: 5, name: '44', type: 'shoe', created_at: '', updated_at: '' },
  { id: 6, name: '45', type: 'shoe', created_at: '', updated_at: '' },
  { id: 7, name: 'M', type: 'clothing', created_at: '', updated_at: '' },
  { id: 8, name: 'L', type: 'clothing', created_at: '', updated_at: '' },
  { id: 9, name: 'XL', type: 'clothing', created_at: '', updated_at: '' },
];

// ─── گارانتی‌ها ───
export const guarantees: Guarantee[] = [
  { id: 1, title: 'گارانتی ۱۸ ماهه شرکتی', months: 18, description: null, created_at: '', updated_at: '' },
  { id: 2, title: 'گارانتی ۲۴ ماهه رسمی', months: 24, description: null, created_at: '', updated_at: '' },
  { id: 3, title: 'گارانتی ۱۲ ماهه', months: 12, description: null, created_at: '', updated_at: '' },
  { id: 4, title: 'ضمانت اصالت و سلامت فیزیکی کالا', months: 0, description: '۷ روز مهلت بازگشت کالا', created_at: '', updated_at: '' },
];

// ─── ویژگی‌ها (Attributes) ───
export const attributes: Attribute[] = [
  { id: 1, title: 'حافظه داخلی', type: 'select', filterable: true, created_at: '', updated_at: '' },
  { id: 2, title: 'حافظه رم', type: 'select', filterable: true, created_at: '', updated_at: '' },
  { id: 3, title: 'اندازه صفحه‌نمایش', type: 'select', filterable: true, created_at: '', updated_at: '' },
  { id: 4, title: 'سری پردازنده', type: 'text', filterable: false, created_at: '', updated_at: '' },
  { id: 5, title: 'نوع اتصال', type: 'select', filterable: true, created_at: '', updated_at: '' },
  { id: 6, title: 'وضوح تصویر', type: 'select', filterable: true, created_at: '', updated_at: '' },
  { id: 7, title: 'فناوری صفحه‌نمایش', type: 'select', filterable: true, created_at: '', updated_at: '' },
  { id: 8, title: 'توان خروجی', type: 'text', filterable: false, created_at: '', updated_at: '' },
  { id: 9, title: 'جنس', type: 'text', filterable: false, created_at: '', updated_at: '' },
  { id: 10, title: 'نویسنده', type: 'text', filterable: false, created_at: '', updated_at: '' },
  { id: 11, title: 'ناشر', type: 'select', filterable: true, created_at: '', updated_at: '' },
  { id: 12, title: 'حجم', type: 'text', filterable: false, created_at: '', updated_at: '' },
  { id: 13, title: 'مناسب برای', type: 'select', filterable: true, created_at: '', updated_at: '' },
  { id: 14, title: 'زبان', type: 'select', filterable: false, created_at: '', updated_at: '' },
];

// ─── مقادیر ویژگی‌ها ───
const av = (
  id: number,
  attribute_id: number,
  value: string,
): AttributeValue => ({ id, attribute_id, value, created_at: '', updated_at: '' });

export const attributeValues: AttributeValue[] = [
  // حافظه داخلی (1-4)
  av(1, 1, '128 گیگابایت'), av(2, 1, '256 گیگابایت'), av(3, 1, '512 گیگابایت'), av(4, 1, '1 ترابایت'),
  // رم (5-8)
  av(5, 2, '6 گیگابایت'), av(6, 2, '8 گیگابایت'), av(7, 2, '12 گیگابایت'), av(8, 2, '16 گیگابایت'),
  // اندازه صفحه‌نمایش (9-16)
  av(9, 3, '6.1 اینچ'), av(10, 3, '6.4 اینچ'), av(11, 3, '6.7 اینچ'), av(12, 3, '6.8 اینچ'),
  av(13, 3, '13.6 اینچ'), av(14, 3, '15.6 اینچ'), av(15, 3, '55 اینچ'), av(16, 3, '65 اینچ'),
  // نوع اتصال (17-19)
  av(17, 5, 'بلوتوث'), av(18, 5, 'بی‌سیم'), av(19, 5, 'باسیم'),
  // وضوح تصویر (20-22)
  av(20, 6, 'Full HD'), av(21, 6, '4K UHD'), av(22, 6, '8K'),
  // فناوری صفحه‌نمایش (23-25)
  av(23, 7, 'OLED'), av(24, 7, 'QLED'), av(25, 7, 'NanoCell'),
  // ناشر (26-28)
  av(26, 11, 'نشر چشمه'), av(27, 11, 'انتشارات ققنوس'), av(28, 11, 'نشر نو'),
  // مناسب برای (29-32)
  av(29, 13, 'استفاده روزمره'), av(30, 13, 'ورزش'), av(31, 13, 'گیمینگ'), av(32, 13, 'حرفه‌ای'),
  // زبان (33-34)
  av(33, 14, 'فارسی'), av(34, 14, 'انگلیسی'),
];
