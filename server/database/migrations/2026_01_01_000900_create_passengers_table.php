<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Travellers on a booking, one row per person per segment.
 *
 * `flight_id` is denormalised from the segment so the database itself can
 * enforce that a seat is sold once per flight — a constraint scoped to the
 * segment would happily let two separate bookings both take 12A.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('passengers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->foreignId('booking_segment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('flight_id')->constrained()->cascadeOnDelete();
            $table->string('first_name', 60);
            $table->string('last_name', 60);
            $table->enum('type', ['adult', 'child', 'infant'])->default('adult');
            $table->string('passport_number', 20)->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('seat_number', 4)->nullable();
            $table->boolean('checked_in')->default(false);
            $table->timestamps();

            $table->unique(['flight_id', 'seat_number'], 'passengers_flight_seat_unique');
            $table->index('last_name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('passengers');
    }
};
