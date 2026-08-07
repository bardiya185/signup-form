<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * سیدر اصلی گینان‌کالا — ایمپورت کامل کاتالوگ و داده‌های نمایشی از فایل‌های JSON
 * (خروجی یک‌به‌یکِ دیتابیس واقعی بک‌اند فعلی؛ scripts/export-seed-json.mjs)
 *
 *   php artisan migrate:fresh --seed
 */
class DatabaseSeeder extends Seeder
{
    /** ترتیب درج جداول (والدها زودتر) */
    private const TABLES = [
        // ۱) کاربران و جغرافیا
        'provinces', 'cities', 'users', 'addresses', 'wallets', 'wallet_transactions',
        'otp_codes', 'personal_access_tokens',
        // ۲) کاتالوگ
        'categories', 'brands', 'colors', 'sizes', 'guarantees', 'attributes', 'attribute_values',
        // ۳) محصولات
        'products', 'product_variants', 'product_images', 'product_videos',
        'product_attributes', 'product_price_history', 'product_questions',
        // ۴) فروشندگان
        'sellers', 'seller_settlements',
        // ۵) تجارت
        'shipping_methods', 'coupons', 'special_offers',
        'carts', 'cart_items', 'orders', 'order_items', 'order_status_history', 'payments',
        // ۶) محتوا و تعامل
        'pages', 'banners', 'sliders', 'menus', 'blog_posts', 'faqs',
        'reviews', 'review_reactions', 'review_images',
        'wishlists', 'compare_lists', 'compare_list_items',
        'notifications', 'push_subscriptions',
        // ۷) پشتیبانی و آنالیتیکس
        'tickets', 'ticket_messages',
        'page_views', 'search_logs', 'product_clicks', 'activity_logs',
        'stock_alerts', 'stock_movements', 'settings',
    ];

    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        $dir = database_path('seeders/data');

        foreach (self::TABLES as $table) {
            $file = "{$dir}/{$table}.json";
            if (!is_file($file)) {
                $this->command?->warn("داده‌ای برای {$table} یافت نشد");
                continue;
            }
            /** @var array<int, array<string, mixed>> $rows */
            $rows = json_decode((string) file_get_contents($file), true) ?: [];
            DB::table($table)->truncate();
            foreach (array_chunk($rows, 500) as $chunk) {
                DB::table($table)->insert(array_map(self::normalizeRow(...), $chunk));
            }
            $this->command?->info("{$table}: " . count($rows) . ' رکورد');
        }

        Schema::enableForeignKeyConstraints();
        $this->command?->info('✓ سید کامل گینان‌کالا بارگذاری شد');
    }

    /** نرمال‌سازی تاریخ‌های ISO (در sqlite همان ISO حفظ می‌شود چون ستون‌ها TEXT هستند) */
    private static function normalizeRow(array $row): array
    {
        if (DB::connection()->getDriverName() === 'sqlite') {
            return $row;
        }
        foreach ($row as $key => $value) {
            if (is_string($value) && preg_match('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/', $value)) {
                $row[$key] = str_replace('T', ' ', substr($value, 0, 19));
            }
        }
        return $row;
    }
}
