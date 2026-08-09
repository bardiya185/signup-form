import type { Banner, Faq, Menu, Page, Slider } from '@/types/domain';

// ─── بنرها ───
const banner = (
  id: number, title: string, image: string, link: string,
  position: Banner['position'], sort_order = 0,
): Banner => ({
  id, title, image, link, position, sort_order,
  starts_at: null, expires_at: null, is_active: true, created_at: '', updated_at: '',
});

export const banners: Banner[] = [
  banner(1, 'جشنواره تابستانه کالای دیجیتال', '/products/tech-photo.jpg', '/category/digital', 'hero', 0),
  banner(2, 'استایل تابستانی با تخفیف‌های ویژه', '/images/fashion-hero.png', '/category/fashion', 'hero', 1),
  banner(3, 'خانه‌ای شیک با بهترین برندها', '/products/home-photo.jpg', '/category/home-kitchen', 'hero', 2),
  banner(4, 'اسپرسوی حرفه‌ای در خانه', '/products/real/unique/coffee.webp', '/product/delonghi-dedica-ec685', 'sidebar', 0),
  banner(5, 'دنیای صدای بی‌سیم', '/products/real/unique/headphones.webp', '/category/headphones', 'sidebar', 1),
  banner(6, 'سبک زندگی سالم', '/products/lifestyle-photo.jpg', '/category/beauty-health', 'category', 0),
];

// ─── اسلایدر اصلی ───
export const sliders: Slider[] = [
  {
    id: 1, title: 'اسلایدر صفحه اصلی', position: 'home_hero', is_active: true,
    items: [
      { image: '/products/tech-photo.jpg', title: 'کالای دیجیتال', link: '/category/digital' },
      { image: '/images/fashion-hero.png', title: 'مد و پوشاک', link: '/category/fashion' },
      { image: '/products/home-photo.jpg', title: 'خانه و آشپزخانه', link: '/category/home-kitchen' },
    ],
    created_at: '', updated_at: '',
  },
];

// ─── منوها ───
export const menus: Menu[] = [
  {
    id: 1, title: 'با گینان‌کالا', location: 'footer_col1', is_active: true,
    items: [
      { label: 'اتاق خبر گینان‌کالا', link: '/blog' },
      { label: 'فروش در گینان‌کالا', link: '/become-seller' },
      { label: 'فرصت‌های شغلی', link: '/careers' },
      { label: 'تماس با ما', link: '/contact' },
      { label: 'درباره ما', link: '/about' },
    ],
    created_at: '', updated_at: '',
  },
  {
    id: 2, title: 'خدمات مشتریان', location: 'footer_col2', is_active: true,
    items: [
      { label: 'پاسخ به پرسش‌های متداول', link: '/faq' },
      { label: 'رویه‌های بازگرداندن کالا', link: '/page/return-policy' },
      { label: 'شرایط استفاده', link: '/page/terms' },
      { label: 'حریم خصوصی', link: '/page/privacy' },
      { label: 'گزارش باگ', link: '/contact' },
    ],
    created_at: '', updated_at: '',
  },
  {
    id: 3, title: 'راهنمای خرید', location: 'footer_col3', is_active: true,
    items: [
      { label: 'نحوه ثبت سفارش', link: '/page/how-to-order' },
      { label: 'رویه ارسال سفارش', link: '/page/shipping' },
      { label: 'شیوه‌های پرداخت', link: '/page/payment-methods' },
    ],
    created_at: '', updated_at: '',
  },
];

// ─── صفحات CMS ───
export const pages: Page[] = [
  {
    id: 1, title: 'رویه‌های بازگرداندن کالا', slug: 'return-policy',
    body: 'شما تا ۷ روز پس از تحویل کالا می‌توانید درخواست بازگشت ثبت کنید. کالا باید در شرایط اولیه و با بسته‌بندی سلامت باشد.',
    status: 'published', meta_title: null, meta_description: null, created_at: '', updated_at: '',
  },
  {
    id: 2, title: 'شرایط استفاده', slug: 'terms',
    body: 'استفاده از وب‌سایت گینان‌کالا به معنای پذیرش شرایط و قوانین استفاده از خدمات است.',
    status: 'published', meta_title: null, meta_description: null, created_at: '', updated_at: '',
  },
  {
    id: 3, title: 'حریم خصوصی', slug: 'privacy',
    body: 'اطلاعات شخصی شما نزد ما محفوظ است و بدون رضایت شما با اشخاص ثالث به اشتراک گذاشته نمی‌شود.',
    status: 'published', meta_title: null, meta_description: null, created_at: '', updated_at: '',
  },
];

// ─── سوالات متداول ───
export const faqs: Faq[] = [
  { id: 1, category: 'سفارش و پرداخت', question: 'چطور سفارشم را ثبت کنم؟', answer: 'کالا را به سبد خرید اضافه کنید، آدرس را انتخاب و پرداخت را تکمیل کنید.', sort_order: 0, is_active: true, created_at: '', updated_at: '' },
  { id: 2, category: 'سفارش و پرداخت', question: 'چه روش‌های پرداختی دارید؟', answer: 'پرداخت اینترنتی از طریق درگاه‌های زرین‌پال، ملت، سامان و کیف پول گینان‌کالا.', sort_order: 1, is_active: true, created_at: '', updated_at: '' },
  { id: 3, category: 'ارسال', question: 'هزینه ارسال چقدر است؟', answer: 'بسته به روش ارسال بین ۴۵ تا ۹۹ هزار تومان. برای خرید بالای ۲ میلیون تومان ارسال با پست پیشتاز رایگان است.', sort_order: 2, is_active: true, created_at: '', updated_at: '' },
  { id: 4, category: 'بازگشت کالا', question: 'شرایط بازگرداندن کالا چیست؟', answer: 'تا ۷ روز پس از تحویل، کالای سالم با بسته‌بندی اولیه قابل بازگشت است.', sort_order: 3, is_active: true, created_at: '', updated_at: '' },
  { id: 5, category: 'حساب کاربری', question: 'چطور رمز عبورم را بازیابی کنم؟', answer: 'از صفحه ورود گزینه «فراموشی رمز» را انتخاب کنید تا کد یکبارمصرف پیامک شود.', sort_order: 4, is_active: true, created_at: '', updated_at: '' },
  { id: 6, category: 'فروشندگان', question: 'چطور می‌توانم در گینان‌کالا فروشنده شوم؟', answer: 'از بخش «فروش در گینان‌کالا» ثبت‌نام کرده و مدارک کسب‌وکار خود را ارسال کنید.', sort_order: 5, is_active: true, created_at: '', updated_at: '' },
];
