<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tickets', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->index('user_id');
            $table->unsignedBigInteger('order_id')->nullable();
            $table->index('order_id');
            $table->string('department', 20); // enum: orders,payments,returns,technical,general
            $table->string('subject', 191);
            $table->string('priority', 20); // enum: low,medium,high,urgent
            $table->string('status', 20); // enum: open,answered,closed
            $table->timestamps();
        });

        Schema::create('ticket_messages', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('ticket_id');
            $table->index('ticket_id');
            $table->unsignedBigInteger('user_id');
            $table->index('user_id');
            $table->text('body');
            $table->json('attachments')->nullable();
            $table->boolean('is_admin');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tickets');
        Schema::dropIfExists('ticket_messages');
    }
};
