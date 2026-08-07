<?php

/**
 * مایگریشن ماژول discounts — تولیدشده خودکار از src/types/domain.ts
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
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('type', 20)->index(); // enum: percentage | fixed
            $table->unsignedBigInteger('value');
            $table->unsignedBigInteger('max_discount')->nullable();
            $table->unsignedBigInteger('min_order_amount')->nullable();
            $table->unsignedInteger('usage_limit')->nullable();
            $table->unsignedInteger('used_count');
            $table->unsignedInteger('per_user_limit');
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->boolean('is_active');
            $table->json('applicable_categories')->nullable();
            $table->json('applicable_products')->nullable();
            $table->timestamps();
        });
        Schema::create('special_offers', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('type', 21)->index(); // enum: incredible_offers | daily_deals
            $table->unsignedBigInteger('product_variant_id')->index();
            $table->unsignedInteger('discount_percentage');
            $table->unsignedBigInteger('discount_price');
            $table->unsignedBigInteger('stock');
            $table->unsignedBigInteger('sold_count');
            $table->timestamp('starts_at');
            $table->timestamp('expires_at');
            $table->boolean('is_active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('special_offers');
        Schema::dropIfExists('coupons');
    }
};
