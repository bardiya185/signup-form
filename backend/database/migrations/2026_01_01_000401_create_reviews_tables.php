<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('product_id');
            $table->index('product_id');
            $table->unsignedBigInteger('user_id');
            $table->index('user_id');
            $table->unsignedBigInteger('order_item_id')->nullable();
            $table->index('order_item_id');
            $table->string('title', 191);
            $table->text('body');
            $table->decimal('rating', 5, 2);
            $table->json('pros')->nullable();
            $table->json('cons')->nullable();
            $table->boolean('is_buyer');
            $table->string('status', 20); // enum: pending,approved,rejected
            $table->unsignedBigInteger('likes_count');
            $table->unsignedBigInteger('dislikes_count');
            $table->timestamps();
        });

        Schema::create('review_reactions', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('review_id');
            $table->index('review_id');
            $table->unsignedBigInteger('user_id');
            $table->index('user_id');
            $table->string('type', 20); // enum: like,dislike
            $table->timestamps();
        });

        Schema::create('review_images', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('review_id');
            $table->index('review_id');
            $table->string('image_path', 191);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
        Schema::dropIfExists('review_reactions');
        Schema::dropIfExists('review_images');
    }
};
