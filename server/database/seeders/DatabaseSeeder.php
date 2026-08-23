<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Order matters: airports and aircraft are referenced by destinations and
     * flights, and bookings need both flights and users to exist first.
     */
    public function run(): void
    {
        $this->call([
            AirportSeeder::class,
            AircraftSeeder::class,
            DestinationSeeder::class,
            OfferSeeder::class,
            UserSeeder::class,
            FlightSeeder::class,
            BookingSeeder::class,
            SupportSeeder::class,
        ]);
    }
}
