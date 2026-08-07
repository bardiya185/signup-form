<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * سیدر اصلی گینان‌کالا — import یک‌به‌یک دیتای واقعی پروژه از
 * backend/database/seeders/data/<table>.json (خروجی scripts/export-seed-json.mjs)
 *
 * نکته datetime: دیتای Next رشته‌های ISO 8601 دارد (`2026-08-08T10:30:00Z`)؛
 * برای ستون‌های timestamp به فرمت `Y-m-d H:i:s` تبدیل می‌کنیم.
 */
class DatabaseSeeder extends Seeder
{
    /** تبدیل بازگشتی رشته‌های ISO 8601 به فرمت datetime مای‌اس‌کیول/اس‌کیولایت */
    private static function normalizeRow(array $row): array
    {
        foreach ($row as $key => $value) {
            if (is_string($value) && preg_match('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?Z?$/', $value)) {
                $ts = strtotime($value);
                $row[$key] = $ts === false ? $value : gmdate('Y-m-d H:i:s', $ts);
            }
        }
        return $row;
    }

    public function run(): void
    {
        $dir = database_path('seeders/data');
        $files = glob($dir . '/*.json') ?: [];
        sort($files);

        Schema::disableForeignKeyConstraints();

        foreach ($files as $file) {
            $table = basename($file, '.json');
            $rows = json_decode((string) file_get_contents($file), true);
            if (!is_array($rows)) {
                continue;
            }
            DB::table($table)->truncate();
            foreach (array_chunk($rows, 500) as $chunk) {
                DB::table($table)->insert(array_map([self::class, 'normalizeRow'], $chunk));
            }
            $this->command?->info("{$table}: " . count($rows));
        }

        Schema::enableForeignKeyConstraints();
    }
}
