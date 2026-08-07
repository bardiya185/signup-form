<?php

/**
 * مایگریشن ماژول cms — تولیدشده خودکار از src/types/domain.ts
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
        Schema::create('pages', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->index();
            $table->text('body');
            $table->string('status', 20)->index(); // enum: draft | published | archived
            $table->string('meta_title')->nullable();
            $table->string('meta_description')->nullable();
            $table->timestamps();
        });
        Schema::create('banners', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('image');
            $table->string('link')->nullable();
            $table->string('position', 20)->index(); // enum: hero | sidebar | category | product
            $table->unsignedInteger('sort_order');
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->boolean('is_active');
            $table->timestamps();
        });
        Schema::create('sliders', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->json('items');
            $table->string('position')->index();
            $table->boolean('is_active');
            $table->timestamps();
        });
        Schema::create('menus', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('location');
            $table->json('items');
            $table->boolean('is_active');
            $table->timestamps();
        });
        Schema::create('blog_posts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('author_id')->index();
            $table->string('title');
            $table->string('slug')->index();
            $table->text('excerpt')->nullable();
            $table->text('body');
            $table->string('image')->nullable();
            $table->unsignedBigInteger('category_id')->nullable()->index();
            $table->string('status', 20)->index(); // enum: draft | published
            $table->timestamp('published_at')->nullable();
            $table->unsignedInteger('view_count');
            $table->string('meta_title')->nullable();
            $table->string('meta_description')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
        Schema::create('faqs', function (Blueprint $table) {
            $table->id();
            $table->string('category');
            $table->text('question');
            $table->text('answer');
            $table->unsignedInteger('sort_order');
            $table->boolean('is_active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('faqs');
        Schema::dropIfExists('blog_posts');
        Schema::dropIfExists('menus');
        Schema::dropIfExists('sliders');
        Schema::dropIfExists('banners');
        Schema::dropIfExists('pages');
    }
};
