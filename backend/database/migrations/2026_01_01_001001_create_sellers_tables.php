<?php

/**
 * مایگریشن ماژول sellers — تولیدشده خودکار از src/types/domain.ts
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
        Schema::create('sellers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->index();
            $table->string('shop_name');
            $table->string('slug')->index();
            $table->string('logo')->nullable();
            $table->text('description')->nullable();
            $table->string('national_id');
            $table->string('phone', 16);
            $table->string('email');
            $table->unsignedBigInteger('province_id')->index();
            $table->unsignedBigInteger('city_id')->index();
            $table->text('address');
            $table->string('shaba_number', 26);
            $table->decimal('commission_rate', 5, 2);
            $table->string('status', 20)->index(); // enum: pending | approved | rejected | suspended
            $table->decimal('rating', 3, 1)->default(0);
            $table->timestamps();
        });
        Schema::create('seller_settlements', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('seller_id')->index();
            $table->unsignedBigInteger('amount');
            $table->string('status', 20)->index(); // enum: pending | paid
            $table->timestamp('paid_at')->nullable();
            $table->string('reference')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seller_settlements');
        Schema::dropIfExists('sellers');
    }
};
