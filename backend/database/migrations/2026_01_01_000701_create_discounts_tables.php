<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coupons', function (Blueprint $table): void {
            $table->id();
            $table->string('code', 191);
            $table->index('code');
            $table->string('type', 20); // enum: percentage,fixed
            $table->unsignedBigInteger('value');
            $table->unsignedBigInteger('max_discount')->nullable();
            $table->unsignedBigInteger('min_order_amount')->nullable();
            $table->unsignedInteger('usage_limit')->nullable();
            $table->unsignedInteger('used_count');
            $table->unsignedInteger('per_user_limit');
            $table->boolean('is_active');
            $table->json('applicable_categories')->nullable();
            $table->json('applicable_products')->nullable();
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });

        Schema::create('special_offers', function (Blueprint $table): void {
            $table->id();
            $table->string('title', 191);
            $table->string('type', 23); // enum: incredible_offers,daily_deals
            $table->unsignedBigInteger('product_variant_id');
            $table->index('product_variant_id');
            $table->unsignedInteger('discount_percentage');
            $table->unsignedBigInteger('discount_price');
            $table->unsignedInteger('stock');
            $table->unsignedInteger('sold_count');
            $table->boolean('is_active');
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });

        Schema::create('wishlists', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->index('user_id');
            $table->unsignedBigInteger('product_id');
            $table->index('product_id');
            $table->timestamps();
        });

        Schema::create('compare_lists', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->index('user_id');
            $table->string('session_id', 191)->nullable();
            $table->index('session_id');
            $table->unsignedBigInteger('category_id');
            $table->index('category_id');
            $table->timestamps();
        });

        Schema::create('compare_list_items', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('compare_list_id');
            $table->index('compare_list_id');
            $table->unsignedBigInteger('product_id');
            $table->index('product_id');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coupons');
        Schema::dropIfExists('special_offers');
        Schema::dropIfExists('wishlists');
        Schema::dropIfExists('compare_lists');
        Schema::dropIfExists('compare_list_items');
    }
};
