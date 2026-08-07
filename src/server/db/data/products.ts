import type {
  Product, ProductAttribute, ProductImage, ProductVariant,
} from '@/types/domain';

const NOW = '2026-08-01T10:00:00Z';
const uniq = (n: string, ext = 'jpg') => `/products/real/unique/${n}.${ext}`;
const real = (n: string, ext = 'jpg') => `/products/real/${n}.${ext}`;

let imageSeq = 0;
const img = (product_id: number, path: string, alt: string, primary = true): ProductImage => ({
  id: ++imageSeq, product_id, image_path: path, alt_text: alt,
  sort_order: primary ? 0 : 1, is_primary: primary, created_at: NOW, updated_at: NOW,
});

let variantSeq = 0;
interface VariantOpts { color?: number | null; size?: number | null; g?: number; max?: number }
const v = (
  product_id: number, sku: string, price: number, sale_price: number | null,
  stock: number, o: VariantOpts = {},
): ProductVariant => ({
  id: ++variantSeq, product_id, sku, price, sale_price, stock,
  max_per_order: o.max ?? 2,
  color_id: o.color ?? null, size_id: o.size ?? null, guarantee_id: o.g ?? 2,
  is_active: true, created_at: NOW, updated_at: NOW,
});

let paSeq = 0;
const paSelect = (product_id: number, attribute_id: number, attribute_value_id: number): ProductAttribute => ({
  id: ++paSeq, product_id, attribute_id, attribute_value_id, custom_value: null, created_at: NOW, updated_at: NOW,
});
const paText = (product_id: number, attribute_id: number, custom_value: string): ProductAttribute => ({
  id: ++paSeq, product_id, attribute_id, attribute_value_id: null, custom_value, created_at: NOW, updated_at: NOW,
});

const p = (
  id: number, category_id: number, brand_id: number | null, seller_id: number,
  title: string, slug: string, short_description: string,
  opts: { featured?: boolean; views?: number; created?: string } = {},
): Product => ({
  id, category_id, brand_id, seller_id, title, slug,
  sku: `GNK-${String(id).padStart(5, '0')}`,
  short_description, body: short_description,
  status: 'active', is_featured: opts.featured ?? false, is_digital: false,
  weight: 500, dimensions: { length: 20, width: 15, height: 10, unit: 'cm' },
  meta_title: title, meta_description: short_description,
  view_count: opts.views ?? 0,
  created_at: opts.created ?? NOW, updated_at: NOW, deleted_at: null,
});

// ─── محصولات ───
export const products: Product[] = [
  p(1, 2, 1, 2, 'گوشی موبایل اپل مدل iPhone 15 Pro ظرفیت 256 گیگابایت',
    'iphone-15-pro-256gb',
    'تجربه‌ای حرفه‌ای از سرعت، دوربین ۴۸ مگاپیکسلی و طراحی تیتانیومی اپل با چیپ A17 Pro.',
    { featured: true, views: 12400, created: '2026-07-20T09:00:00Z' }),
  p(2, 2, 2, 1, 'گوشی موبایل سامسونگ مدل Galaxy S24 Ultra ظرفیت 512 گیگابایت',
    'galaxy-s24-ultra-512gb',
    'قلم S Pen، دوربین ۲۰۰ مگاپیکسلی و هوش مصنوعی Galaxy AI در پرچم‌دار سامسونگ.',
    { featured: true, views: 9800, created: '2026-07-22T09:00:00Z' }),
  p(3, 2, 3, 1, 'گوشی موبایل شیائومی مدل Redmi Note 13 Pro ظرفیت 256 گیگابایت',
    'redmi-note-13-pro',
    'بهترین میان‌رده بازار با دوربین ۲۰۰ مگاپیکسلی و شارژ سریع ۶۷ واتی.',
    { views: 7300, created: '2026-06-15T09:00:00Z' }),
  p(4, 3, 1, 1, 'لپ‌تاپ 13.6 اینچی اپل مدل MacBook Air M3 ظرفیت 256 گیگابایت',
    'macbook-air-m3-13',
    'نازک‌ترین و سبک‌ترین لپ‌تاپ اپل با چیپ M3 و ۱۸ ساعت شارژدهی.',
    { featured: true, views: 8600, created: '2026-07-25T09:00:00Z' }),
  p(5, 3, 7, 2, 'لپ‌تاپ 15.6 اینچی ایسوس مدل TUF Gaming F15 FX507',
    'asus-tuf-gaming-f15',
    'لپ‌تاپ گیمینگ مقاوم با گرافیک RTX 4060 و خنک‌کننده دو فن.',
    { views: 5400, created: '2026-06-10T09:00:00Z' }),
  p(6, 3, 8, 2, 'لپ‌تاپ 15.6 اینچی لنوو مدل IdeaPad Slim 3',
    'lenovo-ideapad-slim-3',
    'همراهی اقتصادی و قابل‌اعتماد برای کارهای روزمره و دانشجویی.',
    { views: 3100, created: '2026-05-18T09:00:00Z' }),
  p(7, 4, 4, 1, 'هدفون بی‌سیم سونی مدل WH-1000XM5',
    'sony-wh-1000xm5',
    'حذف نویز فعال پیشرفته، ۳۰ ساعت پخش موسیقی و کیفیت صدای استودیویی.',
    { featured: true, views: 6900, created: '2026-07-01T09:00:00Z' }),
  p(8, 4, 1, 1, 'هندزفری بی‌سیم اپل مدل AirPods Pro نسل دوم',
    'airpods-pro-2',
    'حذف نویز دو برابر قوی‌تر در ابعادی جمع‌وجور با کیس شارژ MagSafe.',
    { views: 5200, created: '2026-06-05T09:00:00Z' }),
  p(9, 5, 6, 2, 'دوربین دیجیتال کانن مدل EOS R10 همراه لنز RF-S 18-45mm',
    'canon-eos-r10-18-45',
    'بدنه بدون آینه ۲۴.۲ مگاپیکسلی با فیلم‌برداری 4K برای تولید محتوا.',
    { views: 2800, created: '2026-05-25T09:00:00Z' }),
  p(10, 6, 2, 1, 'ساعت هوشمند سامسونگ مدل Galaxy Watch6 Classic 47mm',
    'galaxy-watch6-classic',
    'طراحی کلاسیک با حلقه چرخان، پایش خواب پیشرفته و نمایشگر Sapphire.',
    { featured: true, views: 4300, created: '2026-07-10T09:00:00Z' }),
  p(11, 6, 3, 1, 'مچ‌بند هوشمند شیائومی مدل Smart Band 9',
    'xiaomi-smart-band-9',
    'ردیاب سلامتی جمع‌وجور با ۲۱ روز باتری و ۱۵۰ حالت ورزشی.',
    { views: 8100, created: '2026-07-18T09:00:00Z' }),
  p(12, 8, 4, 1, 'کنسول بازی سونی مدل PlayStation 5 Slim ظرفیت 1 ترابایت',
    'playstation-5-slim',
    'نسل نهم بازی با درایو SSD فوق‌سریع و دسته DualSense بازخورد لمسی.',
    { featured: true, views: 15200, created: '2026-07-28T09:00:00Z' }),
  p(13, 8, 16, 1, 'کنسول بازی مایکروسافت مدل Xbox Series X',
    'xbox-series-x',
    'قدرتمندترین کنسول Xbox با ۱۲ ترافلاپس قدرت پردازش گرافیکی.',
    { views: 6700, created: '2026-06-20T09:00:00Z' }),
  p(14, 16, 5, 4, 'تلویزیون هوشمند ال‌جی مدل C3 OLED سایز 55 اینچ',
    'lg-c3-oled-55',
    'پیکسل‌های خود-نور OLED با کنتراست بی‌نهایت و پردازنده α9 نسل شش.',
    { featured: true, views: 3900, created: '2026-07-05T09:00:00Z' }),
  p(15, 16, 2, 4, 'تلویزیون هوشمند سامسونگ مدل Q60C QLED سایز 55 اینچ',
    'samsung-q60c-qled-55',
    'رنگ‌های زنده Quantum Dot با صدای Object Tracking Sound.',
    { views: 3400, created: '2026-06-12T09:00:00Z' }),
  p(16, 15, 12, 4, 'اسپرسوساز دلونگی مدل Dedica EC685',
    'delonghi-dedica-ec685',
    'اسپرسوی باریک با بدنه استیل، فشار ۱۵ بار و سیستم کاپوچینوساز.',
    { views: 2600, created: '2026-05-30T09:00:00Z' }),
  p(17, 15, 11, 4, 'مخلوط‌کن فیلیپس مدل HR2223 ظرفیت 2 لیتر',
    'philips-hr2223-blender',
    'موتور ۷۰۰ واتی با فناوری ProBlend و تیغه‌های ۴ پره فولادی.',
    { views: 1800, created: '2026-05-14T09:00:00Z' }),
  p(18, 11, 9, 3, 'کفش راحتی مردانه نایک مدل Air Max 270',
    'nike-air-max-270',
    'بزرگ‌ترین واحد Air پاشنه نایک برای راحتی تمام‌روز.',
    { featured: true, views: 5900, created: '2026-07-08T09:00:00Z' }),
  p(19, 11, 10, 3, 'کفش ورزشی مردانه آدیداس مدل Ultraboost Light',
    'adidas-ultraboost-light',
    'سبک‌ترین اولترابوست تاریخ با فوم BOOST بازگرداننده انرژی.',
    { views: 3600, created: '2026-06-25T09:00:00Z' }),
  p(20, 12, 14, 3, 'کیف دوشی زنانه چرم طبیعی آوینا مدل وینا',
    'avina-genuine-leather-bag',
    'چرم طبیعی گاوی با دوخت دستی و آستر مخمل.',
    { views: 2100, created: '2026-05-20T09:00:00Z' }),
  p(21, 13, 17, 3, 'ساعت مچی مردانه کاسیو مدل MTP-V002 Vintage',
    'casio-mtp-vintage',
    'طراحی کلاسیک و مینیمال با موتور کوارتز ژاپنی.',
    { views: 4400, created: '2026-07-15T09:00:00Z' }),
  p(22, 17, 15, 4, 'کتاب هنر شفاف اندیشیدن اثر رولف دوبلی',
    'the-art-of-thinking-clearly-book',
    '۵۲ تله فکری که باید بشناسید؛ پرفروش‌ترین کتاب روان‌شناسی کاربردی.',
    { featured: true, views: 7800, created: '2026-01-10T09:00:00Z' }),
  p(23, 17, null, 4, 'کتاب کیمیاگر اثر پائلو کوئیلو',
    'the-alchemist-book',
    'داستان جاودانه پیروی از رویا، اقتباسی که میلیون‌ها نفر را متحول کرد.',
    { views: 9200, created: '2026-02-14T09:00:00Z' }),
  p(24, 19, 13, 4, 'سرم ضدلک ویتامین C لا روش-پوزای مدل Pure Vitamin C10',
    'la-roche-posay-vitamin-c10-serum',
    'سرم ۱۰٪ ویتامین C خالص برای روشن‌کنندگی و کاهش چروک.',
    { views: 4700, created: '2026-07-12T09:00:00Z' }),
  p(25, 20, 11, 4, 'سشوار فیلیپس مدل DryCare Essential BHD350',
    'philips-bhd350-hairdryer',
    'موتور ۲۱۰۰ واتی با تکنولوژی یونی و سری متمرکزکننده.',
    { views: 2200, created: '2026-06-02T09:00:00Z' }),
];

// ─── واریانت‌ها (قیمت‌ها به تومان) ───
export const productVariants: ProductVariant[] = [
  // 1 — iPhone 15 Pro
  v(1, 'IP15P-256-TN', 76500000, 74900000, 4, { color: 13, g: 2 }),
  v(1, 'IP15P-256-BK', 76500000, 74500000, 3, { color: 1, g: 2 }),
  // 2 — Galaxy S24 Ultra
  v(2, 'S24U-512-GR', 62500000, 59900000, 6, { color: 4, g: 1 }),
  v(2, 'S24U-512-PU', 62500000, 59900000, 2, { color: 11, g: 1 }),
  // 3 — Redmi Note 13 Pro
  v(3, 'RN13P-256-BK', 14200000, 13400000, 15, { color: 1, g: 1, max: 3 }),
  v(3, 'RN13P-256-BL', 14200000, null, 20, { color: 5, g: 1, max: 3 }),
  // 4 — MacBook Air M3
  v(4, 'MBA-M3-256-SV', 69500000, 67900000, 3, { color: 3, g: 2 }),
  // 5 — ASUS TUF F15
  v(5, 'TUF-F15-BK', 58000000, 54900000, 5, { color: 1, g: 2 }),
  // 6 — IdeaPad Slim 3
  v(6, 'IP-SLIM3-GR', 23500000, null, 8, { color: 4, g: 2 }),
  v(6, 'IP-SLIM3-BL', 23500000, null, 5, { color: 5, g: 2 }),
  // 7 — Sony WH-1000XM5
  v(7, 'XM5-BK', 18900000, 17900000, 7, { color: 1, g: 1 }),
  v(7, 'XM5-CR', 18900000, null, 4, { color: 9, g: 1 }),
  // 8 — AirPods Pro 2
  v(8, 'APP2-WT', 12800000, 12100000, 10, { color: 2, g: 2 }),
  // 9 — Canon R10
  v(9, 'R10-1845-BK', 54800000, 52900000, 2, { color: 1, g: 2 }),
  // 10 — Galaxy Watch6
  v(10, 'GW6C-47-BK', 12950000, null, 6, { color: 1, g: 1 }),
  v(10, 'GW6C-47-SV', 12950000, 12400000, 3, { color: 3, g: 1 }),
  // 11 — Mi Band 9
  v(11, 'MB9-BK', 1890000, null, 30, { color: 1, g: 3, max: 5 }),
  v(11, 'MB9-PK', 1890000, 1790000, 25, { color: 10, g: 3, max: 5 }),
  // 12 — PS5 Slim
  v(12, 'PS5S-1TB-WT', 39500000, null, 6, { color: 2, g: 2 }),
  // 13 — Xbox Series X
  v(13, 'XSX-1TB-BK', 27900000, 26500000, 4, { color: 1, g: 2 }),
  // 14 — LG C3
  v(14, 'LGC3-55-BK', 74000000, 69900000, 3, { color: 1, g: 2 }),
  // 15 — Samsung Q60C
  v(15, 'Q60C-55-BK', 38500000, 36900000, 5, { color: 1, g: 2 }),
  // 16 — DeLonghi Dedica
  v(16, 'EC685-ST', 14500000, 13900000, 7, { color: 3, g: 2 }),
  // 17 — Philips Blender
  v(17, 'HR2223-BL', 4850000, 4500000, 12, { color: 5, g: 2, max: 4 }),
  // 18 — Nike Air Max 270
  v(18, 'AM270-WT-42', 6250000, null, 5, { color: 2, size: 3, g: 4 }),
  v(18, 'AM270-WT-43', 6250000, null, 8, { color: 2, size: 4, g: 4 }),
  v(18, 'AM270-RD-42', 6250000, 5900000, 6, { color: 6, size: 3, g: 4 }),
  // 19 — Adidas Ultraboost
  v(19, 'UBL-BK-42', 7400000, null, 7, { color: 1, size: 3, g: 4 }),
  v(19, 'UBL-WT-42', 7400000, 6990000, 4, { color: 2, size: 3, g: 4 }),
  // 20 — Avina Bag
  v(20, 'AVB-BR', 2950000, 2600000, 8, { color: 8, g: 4 }),
  v(20, 'AVB-BK', 2950000, null, 6, { color: 1, g: 4 }),
  // 21 — Casio MTP
  v(21, 'MTPV-GD', 3800000, null, 4, { color: 12, g: 3 }),
  v(21, 'MTPV-SV', 3800000, 3550000, 4, { color: 3, g: 3 }),
  // 22 — Art of Thinking Clearly
  v(22, 'BK-AOTC-001', 265000, null, 31, { g: 4, max: 5 }),
  // 23 — Alchemist
  v(23, 'BK-ALCH-001', 245000, 215000, 40, { g: 4, max: 5 }),
  // 24 — LRP Serum
  v(24, 'LRP-C10-30', 1650000, 1450000, 18, { g: 4, max: 4 }),
  // 25 — Philips Hairdryer
  v(25, 'BHD350-WT', 2100000, 1930000, 14, { color: 2, g: 2, max: 3 }),
];

// ─── تصاویر محصولات ───
export const productImages: ProductImage[] = [
  img(1, uniq('iphone', 'webp'), 'آیفون ۱۵ پرو'),
  img(2, real('phone'), 'گلکسی S24 اولترا'),
  img(3, real('phone'), 'ردمی نوت ۱۳ پرو'),
  img(4, uniq('laptop'), 'مک‌بوک ایر M3'),
  img(5, real('laptop'), 'ایسوس TUF گیمینگ'),
  img(6, real('laptop'), 'لنوو آیدیاپد'),
  img(7, uniq('headphones', 'webp'), 'سونی WH-1000XM5'),
  img(8, real('headphones'), 'ایرپاد پرو ۲'),
  img(9, uniq('camera'), 'کانن EOS R10'),
  img(10, uniq('watch', 'webp'), 'گلکسی واچ ۶'),
  img(11, real('watch'), 'می بند ۹'),
  img(12, uniq('console'), 'پلی‌استیشن ۵ اسلیم'),
  img(13, uniq('console'), 'ایکس‌باکس سری X'),
  img(14, uniq('tv', 'webp'), 'ال‌جی C3 اولد'),
  img(15, uniq('tv', 'webp'), 'سامسونگ QLED'),
  img(16, uniq('coffee', 'webp'), 'اسپرسوساز دلونگی'),
  img(17, uniq('blender'), 'مخلوط‌کن فیلیپس'),
  img(18, uniq('shoe'), 'نایک ایر مکس'),
  img(19, real('sneakers'), 'آدیداس اولترابوست'),
  img(20, uniq('bag'), 'کیف چرم آوینا'),
  img(21, real('bag'), 'ساعت کاسیو'),
  img(22, uniq('book'), 'کتاب هنر شفاف اندیشیدن'),
  img(23, uniq('book'), 'کتاب کیمیاگر'),
  img(24, real('camera'), 'سرم ویتامین C'),
  img(25, real('coffee', 'webp'), 'سشوار فیلیپس'),
];

// ─── ویژگی‌های محصولات (برای جدول مشخصات و فیلترها) ───
export const productAttributes: ProductAttribute[] = [
  // iPhone
  paSelect(1, 1, 2), paSelect(1, 2, 6), paSelect(1, 3, 9), paText(1, 4, 'Apple A17 Pro'), paSelect(1, 13, 32),
  // S24 Ultra
  paSelect(2, 1, 3), paSelect(2, 2, 7), paSelect(2, 3, 12), paText(2, 4, 'Snapdragon 8 Gen 3'), paSelect(2, 13, 32),
  // Redmi
  paSelect(3, 1, 2), paSelect(3, 2, 6), paSelect(3, 3, 11), paText(3, 4, 'Snapdragon 7s Gen 2'), paSelect(3, 13, 29),
  // MacBook
  paSelect(4, 1, 2), paSelect(4, 2, 6), paSelect(4, 3, 13), paText(4, 4, 'Apple M3'), paSelect(4, 13, 32),
  // TUF
  paSelect(5, 1, 3), paSelect(5, 2, 8), paSelect(5, 3, 14), paText(5, 4, 'Intel Core i7 13620H'), paSelect(5, 13, 31),
  // IdeaPad
  paSelect(6, 1, 3), paSelect(6, 2, 6), paSelect(6, 3, 14), paText(6, 4, 'Intel Core i5 13420H'), paSelect(6, 13, 29),
  // Sony XM5
  paSelect(7, 5, 17), paSelect(7, 13, 29),
  // AirPods
  paSelect(8, 5, 17), paSelect(8, 13, 29),
  // Canon
  paSelect(9, 13, 32), paText(9, 4, 'DIGIC X'), paText(9, 9, 'بدنه پلی‌کربنات مستحکم'),
  // Galaxy Watch
  paSelect(10, 5, 17), paSelect(10, 13, 29),
  // Mi Band
  paSelect(11, 5, 17), paSelect(11, 13, 30),
  // PS5
  paSelect(12, 1, 4), paSelect(12, 13, 31),
  // Xbox
  paSelect(13, 1, 4), paSelect(13, 13, 31),
  // LG C3
  paSelect(14, 3, 15), paSelect(14, 6, 21), paSelect(14, 7, 23),
  // Q60C
  paSelect(15, 3, 15), paSelect(15, 6, 21), paSelect(15, 7, 24),
  // DeLonghi
  paText(16, 8, '1350 وات'), paText(16, 9, 'استیل ضدزنگ'),
  // Blender
  paText(17, 8, '700 وات'), paText(17, 9, 'پلاستیک نشکن'),
  // Nike
  paText(18, 9, 'پارچه و چرم مصنوعی'), paSelect(18, 13, 29),
  // Adidas
  paText(19, 9, 'پارچه Primeknit'), paSelect(19, 13, 30),
  // Bag
  paText(20, 9, 'چرم طبیعی گاوی'),
  // Casio
  paText(21, 9, 'استیل ضدزنگ'),
  // Book 1
  paText(22, 10, 'رولف دوبلی'), paSelect(22, 11, 26), paSelect(22, 14, 33),
  // Book 2
  paText(23, 10, 'پائلو کوئیلو'), paSelect(23, 11, 27), paSelect(23, 14, 33),
  // Serum
  paText(24, 12, '30 میلی‌لیتر'), paSelect(24, 13, 29),
  // Hairdryer
  paText(25, 8, '2100 وات'),
];

// ─── تاریخچه قیمت ───
export const priceHistory = [
  { id: 1, product_variant_id: 1, old_price: 78500000, new_price: 76500000, created_at: '2026-07-28T10:00:00Z', updated_at: '' },
  { id: 2, product_variant_id: 19, old_price: 41500000, new_price: 39500000, created_at: '2026-08-02T10:00:00Z', updated_at: '' },
  { id: 3, product_variant_id: 21, old_price: 76000000, new_price: 74000000, created_at: '2026-08-01T10:00:00Z', updated_at: '' },
];
