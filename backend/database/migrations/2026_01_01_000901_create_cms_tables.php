<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pages', function (Blueprint $table): void {
            $table->id();
            $table->string('title', 191);
            $table->string('slug', 191);
            $table->index('slug');
            $table->text('body');
            $table->string('status', 20); // enum: draft,published,archived
            $table->string('meta_title', 191)->nullable();
            $table->text('meta_description')->nullable();
            $table->timestamps();
        });

        Schema::create('banners', function (Blueprint $table): void {
            $table->id();
            $table->string('title', 191);
            $table->string('image', 191);
            $table->string('link', 191)->nullable();
            $table->string('position', 20); // enum: hero,sidebar,category,product
            $table->unsignedInteger('sort_order');
            $table->boolean('is_active');
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });

        Schema::create('sliders', function (Blueprint $table): void {
            $table->id();
            $table->string('title', 191);
            $table->json('items')->nullable();
            $table->string('position', 191);
            $table->boolean('is_active');
            $table->timestamps();
        });

        Schema::create('menus', function (Blueprint $table): void {
            $table->id();
            $table->string('title', 191);
            $table->string('location', 191);
            $table->json('items')->nullable();
            $table->boolean('is_active');
            $table->timestamps();
        });

        Schema::create('blog_posts', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('author_id');
            $table->index('author_id');
            $table->string('title', 191);
            $table->string('slug', 191);
            $table->index('slug');
            $table->string('excerpt', 191)->nullable();
            $table->text('body');
            $table->string('image', 191)->nullable();
            $table->unsignedBigInteger('category_id')->nullable();
            $table->index('category_id');
            $table->string('status', 20); // enum: draft,published
            $table->unsignedInteger('view_count');
            $table->string('meta_title', 191)->nullable();
            $table->text('meta_description')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('faqs', function (Blueprint $table): void {
            $table->id();
            $table->string('category', 191);
            $table->string('question', 191);
            $table->text('answer');
            $table->unsignedInteger('sort_order');
            $table->boolean('is_active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pages');
        Schema::dropIfExists('banners');
        Schema::dropIfExists('sliders');
        Schema::dropIfExists('menus');
        Schema::dropIfExists('blog_posts');
        Schema::dropIfExists('faqs');
    }
};
