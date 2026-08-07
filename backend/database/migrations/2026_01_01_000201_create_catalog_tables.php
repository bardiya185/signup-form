<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->index('parent_id');
            $table->string('title', 191);
            $table->string('slug', 191);
            $table->index('slug');
            $table->string('icon', 191)->nullable();
            $table->string('image', 191)->nullable();
            $table->text('description')->nullable();
            $table->unsignedInteger('sort_order');
            $table->boolean('is_active');
            $table->string('meta_title', 191)->nullable();
            $table->text('meta_description')->nullable();
            $table->timestamps();
        });

        Schema::create('brands', function (Blueprint $table): void {
            $table->id();
            $table->string('title', 191);
            $table->string('slug', 191);
            $table->index('slug');
            $table->string('logo', 191)->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_active');
            $table->string('meta_title', 191)->nullable();
            $table->text('meta_description')->nullable();
            $table->timestamps();
        });

        Schema::create('attributes', function (Blueprint $table): void {
            $table->id();
            $table->string('title', 191);
            $table->boolean('type');
            $table->boolean('filterable');
            $table->timestamps();
        });

        Schema::create('attribute_values', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('attribute_id');
            $table->index('attribute_id');
            $table->string('value', 191);
            $table->timestamps();
        });

        Schema::create('colors', function (Blueprint $table): void {
            $table->id();
            $table->string('name', 191);
            $table->string('hex_code', 191);
            $table->timestamps();
        });

        Schema::create('sizes', function (Blueprint $table): void {
            $table->id();
            $table->string('name', 191);
            $table->string('type', 20); // enum: clothing,shoe,ring,other
            $table->timestamps();
        });

        Schema::create('guarantees', function (Blueprint $table): void {
            $table->id();
            $table->string('title', 191);
            $table->unsignedInteger('months');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('shipping_methods', function (Blueprint $table): void {
            $table->id();
            $table->string('title', 191);
            $table->unsignedBigInteger('cost');
            $table->unsignedBigInteger('estimated_days');
            $table->boolean('is_active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');
        Schema::dropIfExists('brands');
        Schema::dropIfExists('attributes');
        Schema::dropIfExists('attribute_values');
        Schema::dropIfExists('colors');
        Schema::dropIfExists('sizes');
        Schema::dropIfExists('guarantees');
        Schema::dropIfExists('shipping_methods');
    }
};
