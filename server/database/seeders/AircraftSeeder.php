<?php

namespace Database\Seeders;

use App\Models\Aircraft;
use Illuminate\Database\Seeder;

class AircraftSeeder extends Seeder
{
    /** Columns: model, registration, economy rows, business rows, seats/row. */
    private const FLEET = [
        ['Boeing 777-300ER', 'A6-RHA', 42, 8, 6],
        ['Boeing 777-300ER', 'A6-RHB', 42, 8, 6],
        ['Airbus A380-800', 'A6-RHC', 58, 12, 6],
        ['Airbus A350-900', 'A6-RHD', 36, 7, 6],
        ['Airbus A350-900', 'A6-RHE', 36, 7, 6],
        ['Boeing 787-9', 'A6-RHF', 30, 6, 6],
        ['Airbus A320neo', 'A6-RHG', 24, 4, 6],
        ['Airbus A320neo', 'A6-RHH', 24, 4, 6],
    ];

    public function run(): void
    {
        foreach (self::FLEET as [$model, $registration, $economyRows, $businessRows, $seatsPerRow]) {
            Aircraft::updateOrCreate(
                ['registration' => $registration],
                [
                    'model' => $model,
                    'rows_economy' => $economyRows,
                    'rows_business' => $businessRows,
                    'seats_per_row' => $seatsPerRow,
                    'is_active' => true,
                ]
            );
        }
    }
}
