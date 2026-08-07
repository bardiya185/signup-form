<?php

/**
 * مایگریشن ماژول reviews — تولیدشده خودکار از src/types/domain.ts
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
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_id')->index();
            $table->unsignedBigInteger('user_id')->index();
            $table->unsignedBigInteger('order_item_id')->nullable()->index();
            $table->string('title');
            $table->text('body');
            $table->unsignedTinyInteger('rating');
            $table->json('pros');
            $table->json('cons');
            $table->boolean('is_buyer');
            $table->string('status', 20)->index(); // enum: pending | approved | rejected
            $table->unsignedInteger('likes_count');
            $table->unsignedInteger('dislikes_count');
            $table->timestamps();
        });
        Schema::create('review_reactions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('review_id')->index();
            $table->unsignedBigInteger('user_id')->index();
            $table->string('type', 20)->index(); // enum: like | dislike
            $table->timestamps();
        });
        Schema::create('review_images', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('review_id')->index();
            $table->string('image_path');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('review_images');
        Schema::dropIfExists('review_reactions');
        Schema::dropIfExists('reviews');
    }
};
