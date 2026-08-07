import type { Brand, Category } from '@/types/domain';

const cat = (
  id: number,
  parent_id: number | null,
  title: string,
  slug: string,
  icon: string | null,
  image: string | null = null,
  sort = 0,
): Category => ({
  id, parent_id, title, slug, icon, image,
  description: null, sort_order: sort, is_active: true,
  meta_title: title, meta_description: null, created_at: '', updated_at: '',
});

// ─── دسته‌بندی‌ها (درخت تو در تو — مثل دیجی‌کالا) ───
export const categories: Category[] = [
  // کالای دیجیتال
  cat(1, null, 'کالای دیجیتال', 'digital', 'smartphone', '/products/tech-photo.jpg', 1),
  cat(2, 1, 'گوشی موبایل', 'mobile', 'smartphone'),
  cat(3, 1, 'لپ‌تاپ و الترابوک', 'laptop', 'laptop'),
  cat(4, 1, 'هدفون و هندزفری', 'headphones', 'headphones'),
  cat(5, 1, 'دوربین', 'camera', 'camera'),
  cat(6, 1, 'گجت‌های هوشمند', 'wearables', 'watch'),
  // گیمینگ
  cat(7, null, 'گیمینگ و سرگرمی', 'gaming', 'gamepad-2', '/products/real/unique/console.jpg', 2),
  cat(8, 7, 'کنسول بازی', 'consoles', 'gamepad-2'),
  cat(9, 7, 'بازی ویدیویی', 'video-games', 'disc-3'),
  // مد و پوشاک
  cat(10, null, 'مد و پوشاک', 'fashion', 'shirt', '/images/fashion-hero.png', 3),
  cat(11, 10, 'کفش', 'shoes', 'footprints'),
  cat(12, 10, 'کیف', 'bags', 'briefcase'),
  cat(13, 10, 'ساعت', 'watches', 'watch'),
  // خانه و آشپزخانه
  cat(14, null, 'خانه و آشپزخانه', 'home-kitchen', 'armchair', '/products/home-photo.jpg', 4),
  cat(15, 14, 'لوازم آشپزخانه', 'kitchen-appliances', 'refrigerator'),
  cat(16, 14, 'صوتی و تصویری', 'audio-video', 'tv'),
  // کتاب
  cat(17, null, 'کتاب و لوازم التحریر', 'books', 'book-open', '/products/real/unique/book.jpg', 5),
  // زیبایی و سلامت
  cat(18, null, 'زیبایی و سلامت', 'beauty-health', 'sparkles', '/products/lifestyle-photo.jpg', 6),
  cat(19, 18, 'مراقبت پوست', 'skincare', 'droplets'),
  cat(20, 18, 'مراقبت مو', 'haircare', 'wind'),
];

const brand = (id: number, title: string, slug: string): Brand => ({
  id, title, slug, logo: null, description: null, is_active: true,
  meta_title: title, meta_description: null, created_at: '', updated_at: '',
});

// ─── برندها ───
export const brands: Brand[] = [
  brand(1, 'اپل', 'apple'),
  brand(2, 'سامسونگ', 'samsung'),
  brand(3, 'شیائومی', 'xiaomi'),
  brand(4, 'سونی', 'sony'),
  brand(5, 'ال‌جی', 'lg'),
  brand(6, 'کانن', 'canon'),
  brand(7, 'ایسوس', 'asus'),
  brand(8, 'لنوو', 'lenovo'),
  brand(9, 'نایک', 'nike'),
  brand(10, 'آدیداس', 'adidas'),
  brand(11, 'فیلیپس', 'philips'),
  brand(12, 'دلونگی', 'delonghi'),
  brand(13, 'لا روش-پوزای', 'la-roche-posay'),
  brand(14, 'آوینا', 'avina'),
  brand(15, 'نشر چشمه', 'cheshmeh'),
  brand(16, 'مایکروسافت', 'microsoft'),
  brand(17, 'کاسیو', 'casio'),
];
