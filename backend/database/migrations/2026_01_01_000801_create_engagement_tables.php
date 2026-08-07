<?php

/**
 * مایگریشن ماژول engagement — تولیدشده خودکار از src/types/domain.ts
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
        Schema::create('wishlists', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->index();
            $table->unsignedBigInteger('product_id')->index();
            $table->timestamps();
        });
        Schema::create('compare_lists', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->string('session_id')->nullable();
            $table->unsignedBigInteger('category_id')->index();
            $table->timestamps();
        });
        Schema::create('compare_list_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('compare_list_id')->index();
            $table->unsignedBigInteger('product_id')->index();
            $table->timestamps();
        });
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->index();
            $table->string('type', 20)->index(); // enum: order_status | price_drop | back_in_stock | promotion | system
            $table->string('title');
            $table->text('body');
            $table->json('data')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });
        Schema::create('push_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->index();
            $table->text('endpoint');
            $table->json('keys');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('push_subscriptions');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('compare_list_items');
        Schema::dropIfExists('compare_lists');
        Schema::dropIfExists('wishlists');
    }
};
