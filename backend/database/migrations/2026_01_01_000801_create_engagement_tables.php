<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->index('user_id');
            $table->string('type', 20); // enum: order_status,price_drop,back_in_stock,promotion,system
            $table->string('title', 191);
            $table->text('body');
            $table->json('data')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });

        Schema::create('push_subscriptions', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->index('user_id');
            $table->string('endpoint', 191);
            $table->json('keys')->nullable();
            $table->timestamps();
        });

        Schema::create('stock_alerts', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->index('user_id');
            $table->string('phone', 191)->nullable();
            $table->index('phone');
            $table->unsignedBigInteger('product_variant_id');
            $table->index('product_variant_id');
            $table->timestamp('created_at')->nullable();
            // created_at به‌صورت دستی مدیریت می‌شود
        });

        Schema::create('stock_movements', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('product_variant_id');
            $table->index('product_variant_id');
            $table->unsignedBigInteger('old_stock');
            $table->unsignedBigInteger('new_stock');
            $table->unsignedBigInteger('delta');
            $table->text('reason');
            $table->unsignedBigInteger('changed_by')->nullable();
            $table->index('changed_by');
            $table->timestamp('created_at')->nullable();
            // created_at به‌صورت دستی مدیریت می‌شود
        });

        Schema::create('activity_logs', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->index('user_id');
            $table->string('action', 191);
            $table->string('subject_type', 191)->nullable();
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->index('subject_id');
            $table->text('description')->nullable();
            $table->timestamp('created_at')->nullable();
            // created_at به‌صورت دستی مدیریت می‌شود
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('push_subscriptions');
        Schema::dropIfExists('stock_alerts');
        Schema::dropIfExists('stock_movements');
        Schema::dropIfExists('activity_logs');
    }
};
