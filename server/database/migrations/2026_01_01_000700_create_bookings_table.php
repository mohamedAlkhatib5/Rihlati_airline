<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * One reservation. `pnr` is the six-character code a traveller quotes to look
 * the booking up, so it is unique and indexed.
 *
 * `user_id` is nullable on purpose: guests can book without an account, and a
 * booking must survive the deletion of the account that made it.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->char('pnr', 6)->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('offer_id')->nullable()->constrained()->nullOnDelete();
            $table->string('contact_email', 191)->index();
            $table->string('contact_phone', 32)->nullable();
            $table->enum('trip_type', ['one', 'round'])->default('round');
            $table->enum('status', ['pending', 'confirmed', 'cancelled', 'completed'])
                ->default('pending')
                ->index();
            $table->unsignedInteger('subtotal_amount');
            $table->unsignedInteger('discount_amount')->default(0);
            $table->unsignedInteger('total_amount');
            $table->char('currency', 3)->default('USD');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
