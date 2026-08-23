<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Airports are the network's building blocks: every flight references two of
 * them, and every destination is presented on top of one.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('airports', function (Blueprint $table) {
            $table->id();
            $table->char('iata', 3)->unique();
            $table->string('name_en', 120);
            $table->string('name_ar', 120);
            $table->string('city_en', 80);
            $table->string('city_ar', 80);
            $table->string('country_en', 80);
            $table->string('country_ar', 80);
            $table->string('timezone', 64)->default('UTC');
            $table->timestamps();

            $table->index('city_en');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('airports');
    }
};
