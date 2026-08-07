<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table): void {
            $table->id();
            $table->string('first_name', 191);
            $table->string('last_name', 191);
            $table->string('email', 191)->nullable();
            $table->index('email');
            $table->string('phone', 191);
            $table->index('phone');
            $table->string('password', 191);
            $table->string('national_code', 191)->nullable();
            $table->string('avatar', 191)->nullable();
            $table->string('birth_date', 191)->nullable();
            $table->string('gender', 20)->nullable(); // enum: male,female
            $table->string('status', 20); // enum: active,banned,inactive
            $table->string('role', 20); // enum: super_admin,admin,seller,customer,warehouse
            $table->string('remember_token', 191)->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->timestamp('phone_verified_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('otp_codes', function (Blueprint $table): void {
            $table->id();
            $table->string('phone', 191);
            $table->index('phone');
            $table->string('code', 191);
            $table->index('code');
            $table->timestamp('expired_at')->nullable();
            $table->timestamp('used_at')->nullable();
            $table->timestamps();
        });

        Schema::create('personal_access_tokens', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->index('user_id');
            $table->string('token', 120);
            $table->index('token');
            $table->string('name', 191);
            $table->json('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->timestamp('created_at')->nullable();
            // created_at به‌صورت دستی مدیریت می‌شود
        });

        Schema::create('addresses', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->index('user_id');
            $table->string('title', 191);
            $table->unsignedBigInteger('province_id');
            $table->index('province_id');
            $table->unsignedBigInteger('city_id');
            $table->index('city_id');
            $table->string('full_address', 191);
            $table->string('postal_code', 191);
            $table->decimal('lat', 10, 7)->nullable();
            $table->decimal('lng', 10, 7)->nullable();
            $table->string('receiver_name', 191);
            $table->string('receiver_phone', 191);
            $table->boolean('is_default');
            $table->timestamps();
        });

        Schema::create('provinces', function (Blueprint $table): void {
            $table->id();
            $table->string('name', 191);
            $table->string('slug', 191);
            $table->index('slug');
        });

        Schema::create('cities', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('province_id');
            $table->index('province_id');
            $table->string('name', 191);
            $table->string('slug', 191);
            $table->index('slug');
        });

        Schema::create('settings', function (Blueprint $table): void {
            $table->string('key')->primary();
            $table->text('value')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('otp_codes');
        Schema::dropIfExists('personal_access_tokens');
        Schema::dropIfExists('addresses');
        Schema::dropIfExists('provinces');
        Schema::dropIfExists('cities');
        Schema::dropIfExists('settings');
    }
};
