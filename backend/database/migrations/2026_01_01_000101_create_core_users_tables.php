<?php

/**
 * مایگریشن ماژول core_users — تولیدشده خودکار از src/types/domain.ts
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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->nullable();
            $table->string('phone', 16)->unique();
            $table->string('password');
            $table->string('national_code', 16)->nullable();
            $table->string('avatar')->nullable();
            $table->date('birth_date')->nullable();
            $table->string('gender', 20)->nullable(); // enum: male | female
            $table->timestamp('email_verified_at')->nullable();
            $table->timestamp('phone_verified_at')->nullable();
            $table->string('status', 20)->index(); // enum: active | banned | inactive
            $table->string('role', 20)->index(); // enum: super_admin | admin | seller | customer | warehouse
            $table->string('remember_token')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
        Schema::create('addresses', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->index();
            $table->string('title');
            $table->unsignedBigInteger('province_id')->index();
            $table->unsignedBigInteger('city_id')->index();
            $table->text('full_address');
            $table->string('postal_code', 16);
            $table->decimal('lat', 10, 7)->nullable();
            $table->decimal('lng', 11, 7)->nullable();
            $table->string('receiver_name');
            $table->string('receiver_phone', 16);
            $table->boolean('is_default');
            $table->timestamps();
        });
        Schema::create('provinces', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->index();
        });
        Schema::create('cities', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('province_id')->index();
            $table->string('name');
            $table->string('slug')->index();
        });
        Schema::create('otp_codes', function (Blueprint $table) {
            $table->id();
            $table->string('phone', 16);
            $table->string('code');
            $table->timestamp('expired_at');
            $table->timestamp('used_at')->nullable();
            $table->timestamps();
        });
        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->index();
            $table->string('token');
            $table->string('name');
            $table->json('abilities');
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at');
            $table->timestamp('revoked_at')->nullable();
            $table->timestamp('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('personal_access_tokens');
        Schema::dropIfExists('otp_codes');
        Schema::dropIfExists('cities');
        Schema::dropIfExists('provinces');
        Schema::dropIfExists('addresses');
        Schema::dropIfExists('users');
    }
};
