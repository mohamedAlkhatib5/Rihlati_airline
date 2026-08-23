<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adds the fields the airline needs on top of Laravel's default user table.
 *
 * `role` gates the admin dashboard: `admin` has full access, `staff` can read
 * operational data, `customer` only ever sees their own bookings.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['customer', 'staff', 'admin'])
                ->default('customer')
                ->after('email')
                ->index();
            $table->string('phone', 32)->nullable()->after('role');
            $table->boolean('is_active')->default(true)->after('phone');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'phone', 'is_active']);
        });
    }
};
