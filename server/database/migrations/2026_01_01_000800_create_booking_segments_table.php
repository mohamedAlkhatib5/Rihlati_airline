<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Links a booking to the flights it covers. A round trip has two rows; a
 * one-way trip has one. Keeping this separate is what allows multi-leg
 * itineraries later without reshaping `bookings`.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('booking_segments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->foreignId('flight_id')->constrained()->restrictOnDelete();
            $table->foreignId('fare_class_id')->constrained()->restrictOnDelete();
            $table->enum('direction', ['outbound', 'return'])->default('outbound');
            $table->timestamps();

            $table->index(['flight_id', 'direction']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_segments');
    }
};
