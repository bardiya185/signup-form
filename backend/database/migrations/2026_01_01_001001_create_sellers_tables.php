<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sellers', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->index('user_id');
            $table->string('shop_name', 191);
            $table->string('slug', 191);
            $table->index('slug');
            $table->string('logo', 191)->nullable();
            $table->text('description')->nullable();
            $table->string('national_id', 191);
            $table->string('phone', 191);
            $table->index('phone');
            $table->string('email', 191);
            $table->index('email');
            $table->unsignedBigInteger('province_id');
            $table->index('province_id');
            $table->unsignedBigInteger('city_id');
            $table->index('city_id');
            $table->text('address');
            $table->string('shaba_number', 191);
            $table->decimal('commission_rate', 5, 2);
            $table->string('status', 20); // enum: pending,approved,rejected,suspended
            $table->decimal('rating', 5, 2);
            $table->timestamps();
        });

        Schema::create('seller_settlements', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('seller_id');
            $table->index('seller_id');
            $table->unsignedBigInteger('amount');
            $table->string('status', 20); // enum: pending,paid
            $table->string('reference', 191)->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sellers');
        Schema::dropIfExists('seller_settlements');
    }
};
