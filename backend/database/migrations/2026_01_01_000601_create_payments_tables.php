<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->index('user_id');
            $table->unsignedBigInteger('order_id')->nullable();
            $table->index('order_id');
            $table->unsignedBigInteger('amount');
            $table->string('method', 20); // enum: zarinpal,mellat,saman,wallet
            $table->string('status', 20); // enum: pending,success,failed,refunded
            $table->string('transaction_id', 120)->nullable();
            $table->index('transaction_id');
            $table->string('ref_number', 60)->nullable();
            $table->json('gateway_response')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });

        Schema::create('wallets', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->index('user_id');
            $table->unsignedBigInteger('balance');
            $table->timestamps();
        });

        Schema::create('wallet_transactions', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('wallet_id');
            $table->index('wallet_id');
            $table->string('type', 20); // enum: deposit,withdraw
            $table->unsignedBigInteger('amount');
            $table->text('description')->nullable();
            $table->string('reference_id', 191)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
        Schema::dropIfExists('wallets');
        Schema::dropIfExists('wallet_transactions');
    }
};
