<?php

/**
 * مایگریشن ماژول orders — تولیدشده خودکار از src/types/domain.ts
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
        Schema::create('carts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->string('session_id')->nullable();
            $table->unsignedBigInteger('coupon_id')->nullable()->index();
            $table->timestamps();
        });
        Schema::create('cart_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('cart_id')->index();
            $table->unsignedBigInteger('product_variant_id')->index();
            $table->unsignedInteger('quantity');
            $table->timestamps();
        });
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->index();
            $table->unsignedBigInteger('address_id')->index();
            $table->string('order_number')->unique();
            $table->string('status', 20)->index(); // enum: pending | processing | shipped | delivered | cancelled | returned
            $table->string('payment_status', 20); // enum: pending | paid | failed | refunded
            $table->string('payment_method', 20); // enum: zarinpal | mellat | saman | wallet
            $table->unsignedBigInteger('subtotal');
            $table->unsignedBigInteger('shipping_cost');
            $table->unsignedBigInteger('tax_amount');
            $table->unsignedBigInteger('discount_amount');
            $table->unsignedBigInteger('total_amount');
            $table->unsignedBigInteger('coupon_id')->nullable()->index();
            $table->unsignedBigInteger('coupon_discount');
            $table->text('notes')->nullable();
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('order_id')->index();
            $table->unsignedBigInteger('product_variant_id')->index();
            $table->string('product_title');
            $table->json('variant_info');
            $table->unsignedInteger('quantity');
            $table->unsignedBigInteger('unit_price');
            $table->unsignedBigInteger('total_price');
            $table->timestamps();
        });
        Schema::create('order_status_history', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('order_id')->index();
            $table->string('old_status', 20)->nullable(); // enum: pending | processing | shipped | delivered | cancelled | returned
            $table->string('new_status', 20); // enum: pending | processing | shipped | delivered | cancelled | returned
            $table->text('description')->nullable();
            $table->unsignedBigInteger('changed_by')->nullable()->index();
            $table->timestamps();
        });
        Schema::create('shipping_methods', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->unsignedBigInteger('cost');
            $table->unsignedInteger('estimated_days');
            $table->boolean('is_active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shipping_methods');
        Schema::dropIfExists('order_status_history');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('cart_items');
        Schema::dropIfExists('carts');
    }
};
