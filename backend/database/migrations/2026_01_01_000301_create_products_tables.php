<?php

/**
 * مایگریشن ماژول products — تولیدشده خودکار از src/types/domain.ts
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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('category_id')->index();
            $table->unsignedBigInteger('brand_id')->nullable()->index();
            $table->unsignedBigInteger('seller_id')->nullable()->index();
            $table->string('title');
            $table->string('slug')->index();
            $table->string('sku')->unique();
            $table->text('short_description')->nullable();
            $table->text('body')->nullable();
            $table->string('status', 20)->index(); // enum: draft | active | inactive | pending_review
            $table->boolean('is_featured');
            $table->boolean('is_digital');
            $table->unsignedInteger('weight')->nullable();
            $table->json('dimensions')->nullable();
            $table->string('meta_title')->nullable();
            $table->string('meta_description')->nullable();
            $table->unsignedInteger('view_count');
            $table->timestamps();
            $table->softDeletes();
        });
        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_id')->index();
            $table->string('sku');
            $table->unsignedBigInteger('price');
            $table->unsignedBigInteger('sale_price')->nullable();
            $table->unsignedBigInteger('stock');
            $table->unsignedBigInteger('max_per_order');
            $table->unsignedBigInteger('color_id')->nullable()->index();
            $table->unsignedBigInteger('size_id')->nullable()->index();
            $table->unsignedBigInteger('guarantee_id')->nullable()->index();
            $table->boolean('is_active');
            $table->timestamps();
        });
        Schema::create('product_images', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_id')->index();
            $table->string('image_path');
            $table->string('alt_text')->nullable();
            $table->unsignedInteger('sort_order');
            $table->boolean('is_primary');
            $table->timestamps();
        });
        Schema::create('product_videos', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_id')->index();
            $table->string('video_url');
            $table->string('thumbnail')->nullable();
            $table->timestamps();
        });
        Schema::create('product_attributes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_id')->index();
            $table->unsignedBigInteger('attribute_id')->index();
            $table->unsignedBigInteger('attribute_value_id')->nullable()->index();
            $table->string('custom_value')->nullable();
            $table->timestamps();
        });
        Schema::create('product_price_history', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_variant_id')->index();
            $table->unsignedBigInteger('old_price');
            $table->unsignedBigInteger('new_price');
            $table->timestamps();
        });
        Schema::create('product_questions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_id')->index();
            $table->unsignedBigInteger('user_id')->index();
            $table->text('question');
            $table->text('answer')->nullable();
            $table->unsignedBigInteger('answered_by')->nullable()->index();
            $table->timestamp('answered_at')->nullable();
            $table->string('status', 20)->index(); // enum: pending | answered | rejected
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_questions');
        Schema::dropIfExists('product_price_history');
        Schema::dropIfExists('product_attributes');
        Schema::dropIfExists('product_videos');
        Schema::dropIfExists('product_images');
        Schema::dropIfExists('product_variants');
        Schema::dropIfExists('products');
    }
};
