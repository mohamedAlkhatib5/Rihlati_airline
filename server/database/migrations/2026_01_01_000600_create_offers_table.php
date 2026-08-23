<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Promotional fares and discount codes shown on the offers page and applied at
 * checkout.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('offers', function (Blueprint $table) {
            $table->id();
            $table->string('code', 24)->unique();
            $table->string('title_en', 120);
            $table->string('title_ar', 120);
            $table->text('description_en')->nullable();
            $table->text('description_ar')->nullable();
            $table->foreignId('destination_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('discount_type', ['percent', 'fixed']);
            $table->unsignedInteger('discount_value');
            $table->date('valid_from');
            $table->date('valid_to');
            $table->unsignedInteger('max_uses')->nullable();
            $table->unsignedInteger('used_count')->default(0);
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('offers');
    }
};
