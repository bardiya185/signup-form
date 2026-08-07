<?php

/**
 * مایگریشن ماژول analytics — تولیدشده خودکار از src/types/domain.ts
 * نکته: کلیدهای خارجی عمداً به‌صورت index تعریف شده‌اند (بدون constraint) تا
 * سید/ترانکت ساده بماند؛ در سخت‌گیری پروداکشن می‌توان FK اضافه کرد.
 */
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('page_views', function (Blueprint $table) {
            $table->id();
            $table->string('url');
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->string('ip');
            $table->text('user_agent');
            $table->timestamp('created_at');
        });
        Schema::create('search_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->string('query');
            $table->unsignedInteger('results_count');
            $table->timestamp('created_at');
        });
        Schema::create('product_clicks', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_id')->index();
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->string('source');
            $table->timestamp('created_at');
        });
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->string('action');
            $table->string('subject_type')->nullable();
            $table->unsignedBigInteger('subject_id')->nullable()->index();
            $table->text('description')->nullable();
            $table->timestamp('created_at');
        });
        Schema::create('stock_alerts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->string('phone', 16)->nullable();
            $table->unsignedBigInteger('product_variant_id')->index();
            $table->timestamp('created_at');
        });
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_variant_id')->index();
            $table->unsignedInteger('old_stock');
            $table->unsignedInteger('new_stock');
            $table->unsignedInteger('delta');
            $table->string('reason');
            $table->unsignedBigInteger('changed_by')->nullable()->index();
            $table->timestamp('created_at');
        });
        Schema::create('settings', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->text('value');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
        Schema::dropIfExists('stock_movements');
        Schema::dropIfExists('stock_alerts');
        Schema::dropIfExists('activity_logs');
        Schema::dropIfExists('product_clicks');
        Schema::dropIfExists('search_logs');
        Schema::dropIfExists('page_views');
    }
};
