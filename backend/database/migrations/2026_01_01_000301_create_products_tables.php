<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('category_id');
            $table->index('category_id');
            $table->unsignedBigInteger('brand_id')->nullable();
            $table->index('brand_id');
            $table->unsignedBigInteger('seller_id')->nullable();
            $table->index('seller_id');
            $table->string('title', 191);
            $table->string('slug', 191);
            $table->index('slug');
            $table->string('sku', 191);
            $table->text('short_description')->nullable();
            $table->text('body')->nullable();
            $table->string('status', 20); // enum: draft,active,inactive,pending_review
            $table->boolean('is_featured');
            $table->boolean('is_digital');
            $table->unsignedBigInteger('weight')->nullable();
            $table->json('dimensions')->nullable();
            $table->string('meta_title', 191)->nullable();
            $table->text('meta_description')->nullable();
            $table->unsignedInteger('view_count');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('product_variants', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('product_id');
            $table->index('product_id');
            $table->string('sku', 191);
            $table->unsignedBigInteger('price');
            $table->unsignedBigInteger('sale_price')->nullable();
            $table->unsignedInteger('stock');
            $table->unsignedInteger('max_per_order');
            $table->unsignedBigInteger('color_id')->nullable();
            $table->index('color_id');
            $table->unsignedBigInteger('size_id')->nullable();
            $table->index('size_id');
            $table->unsignedBigInteger('guarantee_id')->nullable();
            $table->index('guarantee_id');
            $table->boolean('is_active');
            $table->timestamps();
        });

        Schema::create('product_images', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('product_id');
            $table->index('product_id');
            $table->string('image_path', 191);
            $table->string('alt_text', 191)->nullable();
            $table->unsignedInteger('sort_order');
            $table->boolean('is_primary');
            $table->timestamps();
        });

        Schema::create('product_videos', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('product_id');
            $table->index('product_id');
            $table->string('video_url', 191);
            $table->string('thumbnail', 191)->nullable();
            $table->timestamps();
        });

        Schema::create('product_attributes', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('product_id');
            $table->index('product_id');
            $table->unsignedBigInteger('attribute_id');
            $table->index('attribute_id');
            $table->unsignedBigInteger('attribute_value_id')->nullable();
            $table->index('attribute_value_id');
            $table->string('custom_value', 191)->nullable();
            $table->timestamps();
        });

        Schema::create('product_price_history', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('product_variant_id');
            $table->index('product_variant_id');
            $table->unsignedBigInteger('old_price');
            $table->unsignedBigInteger('new_price');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
        Schema::dropIfExists('product_variants');
        Schema::dropIfExists('product_images');
        Schema::dropIfExists('product_videos');
        Schema::dropIfExists('product_attributes');
        Schema::dropIfExists('product_price_history');
    }
};
