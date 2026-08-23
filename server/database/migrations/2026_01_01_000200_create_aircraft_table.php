<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The fleet. Seat counts per cabin drive both seat maps and availability.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('aircraft', function (Blueprint $table) {
            $table->id();
            $table->string('model', 60);
            $table->string('registration', 12)->unique();
            $table->unsignedSmallInteger('rows_economy')->default(24);
            $table->unsignedSmallInteger('rows_business')->default(6);
            $table->unsignedTinyInteger('seats_per_row')->default(6);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('aircraft');
    }
};
