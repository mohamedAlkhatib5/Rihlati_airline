<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Payment attempts against a booking.
 *
 * Card numbers are never stored — only the brand and last four digits, which
 * is all a confirmation screen or receipt legitimately needs.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('amount');
            $table->char('currency', 3)->default('USD');
            $table->enum('method', ['card', 'wallet', 'transfer'])->default('card');
            $table->string('card_brand', 20)->nullable();
            $table->char('card_last4', 4)->nullable();
            $table->enum('status', ['pending', 'paid', 'failed', 'refunded'])
                ->default('pending')
                ->index();
            $table->string('reference', 40)->unique();
            $table->dateTime('paid_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
