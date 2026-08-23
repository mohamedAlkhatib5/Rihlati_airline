<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * A scheduled flight. Search hits this table hard, so the route + date
 * combination carries a composite index.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('flights', function (Blueprint $table) {
            $table->id();
            $table->string('flight_number', 8)->index();
            $table->foreignId('aircraft_id')->constrained('aircraft')->restrictOnDelete();
            $table->foreignId('origin_airport_id')->constrained('airports')->restrictOnDelete();
            $table->foreignId('destination_airport_id')->constrained('airports')->restrictOnDelete();
            $table->dateTime('departure_at');
            $table->dateTime('arrival_at');
            $table->unsignedSmallInteger('duration_minutes');
            $table->unsignedInteger('base_price');
            $table->unsignedTinyInteger('stops')->default(0);
            $table->enum('status', ['scheduled', 'delayed', 'departed', 'arrived', 'cancelled'])
                ->default('scheduled')
                ->index();
            $table->timestamps();

            $table->index(
                ['origin_airport_id', 'destination_airport_id', 'departure_at'],
                'flights_route_date_index'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('flights');
    }
};
