<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Price and inventory per cabin. Availability lives here rather than on the
 * flight, so economy can sell out while business is still open.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fare_classes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('flight_id')->constrained()->cascadeOnDelete();
            $table->enum('cabin', ['economy', 'premium', 'business', 'first']);
            $table->unsignedInteger('price');
            $table->unsignedSmallInteger('seats_total');
            $table->unsignedSmallInteger('seats_available');
            $table->timestamps();

            $table->unique(['flight_id', 'cabin']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fare_classes');
    }
};
