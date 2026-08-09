<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('carts', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->index('user_id');
            $table->string('session_id', 191)->nullable();
            $table->index('session_id');
            $table->unsignedBigInteger('coupon_id')->nullable();
            $table->index('coupon_id');
            $table->timestamps();
        });

        Schema::create('cart_items', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('cart_id');
            $table->index('cart_id');
            $table->unsignedBigInteger('product_variant_id');
            $table->index('product_variant_id');
            $table->unsignedInteger('quantity');
            $table->timestamps();
        });

        Schema::create('orders', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->index('user_id');
            $table->unsignedBigInteger('address_id');
            $table->index('address_id');
            $table->string('order_number', 191);
            $table->index('order_number');
            $table->string('status', 20); // enum: pending,processing,shipped,delivered,cancelled,returned
            $table->string('payment_status', 20); // enum: pending,paid,failed,refunded
            $table->string('payment_method', 20); // enum: zarinpal,mellat,saman,wallet
            $table->unsignedBigInteger('subtotal');
            $table->unsignedBigInteger('shipping_cost');
            $table->unsignedBigInteger('tax_amount');
            $table->unsignedBigInteger('discount_amount');
            $table->unsignedBigInteger('total_amount');
            $table->unsignedBigInteger('coupon_id')->nullable();
            $table->index('coupon_id');
            $table->unsignedBigInteger('coupon_discount');
            $table->string('notes', 191)->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('order_items', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('order_id');
            $table->index('order_id');
            $table->unsignedBigInteger('product_variant_id');
            $table->index('product_variant_id');
            $table->string('product_title', 191);
            $table->json('variant_info')->nullable();
            $table->unsignedInteger('quantity');
            $table->unsignedBigInteger('unit_price');
            $table->unsignedBigInteger('total_price');
            $table->timestamps();
        });

        Schema::create('order_status_history', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('order_id');
            $table->index('order_id');
            $table->string('old_status', 20)->nullable(); // enum: pending,processing,shipped,delivered,cancelled,returned
            $table->string('new_status', 20); // enum: pending,processing,shipped,delivered,cancelled,returned
            $table->text('description')->nullable();
            $table->unsignedBigInteger('changed_by')->nullable();
            $table->index('changed_by');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('carts');
        Schema::dropIfExists('cart_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('order_status_history');
    }
};
