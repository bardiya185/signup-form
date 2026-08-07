<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('page_views', function (Blueprint $table): void {
            $table->id();
            $table->string('url', 191);
            $table->unsignedBigInteger('user_id')->nullable();
            $table->index('user_id');
            $table->string('ip', 191);
            $table->string('user_agent', 191);
            $table->timestamp('created_at')->nullable();
            // created_at به‌صورت دستی مدیریت می‌شود
        });

        Schema::create('search_logs', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->index('user_id');
            $table->string('query', 191);
            $table->unsignedBigInteger('results_count');
            $table->timestamp('created_at')->nullable();
            // created_at به‌صورت دستی مدیریت می‌شود
        });

        Schema::create('product_clicks', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('product_id');
            $table->index('product_id');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->index('user_id');
            $table->string('source', 191);
            $table->timestamp('created_at')->nullable();
            // created_at به‌صورت دستی مدیریت می‌شود
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('page_views');
        Schema::dropIfExists('search_logs');
        Schema::dropIfExists('product_clicks');
    }
};
