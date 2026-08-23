<?php

namespace Database\Seeders;

use App\Models\Aircraft;
use App\Models\Airport;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FlightSeeder extends Seeder
{
    /** Every route radiates from the Dubai hub. */
    private const HUB = 'DXB';

    /** Days of schedule generated from today. */
    private const SCHEDULE_DAYS = 45;

    /**
     * Route table: IATA => [block time in minutes, base economy fare,
     * departures per day].
     */
    private const ROUTES = [
        'LHR' => [425, 649, 2],
        'CDG' => [400, 579, 2],
        'IST' => [275, 459, 2],
        'JFK' => [830, 899, 1],
        'MLE' => [260, 729, 1],
        'HND' => [585, 849, 1],
        'FCO' => [375, 539, 1],
        'BCN' => [425, 559, 1],
        'CAI' => [240, 289, 2],
        'RUH' => [110, 249, 3],
        'DOH' => [65, 199, 3],
        'AMS' => [425, 599, 1],
        'SIN' => [445, 789, 1],
        'BKK' => [380, 699, 1],
        'KUL' => [445, 719, 1],
        'CMN' => [480, 469, 1],
        'ATH' => [300, 499, 1],
        'VIE' => [380, 609, 1],
        'ZRH' => [400, 669, 1],
        'BEY' => [220, 279, 2],
        'AMM' => [190, 259, 2],
        'MCT' => [60, 189, 3],
        'JED' => [175, 269, 2],
        'YYZ' => [825, 949, 1],
    ];

    /** Local departure slots, spread across the day. */
    private const SLOTS = ['02:15', '08:40', '14:25', '20:05'];

    public function run(): void
    {
        $airports = Airport::pluck('id', 'iata');
        $fleet = Aircraft::where('is_active', true)->get();
        $hubId = $airports[self::HUB];

        $today = CarbonImmutable::today();
        $flightRows = [];
        $sequence = 100;

        foreach (self::ROUTES as $iata => [$minutes, $basePrice, $perDay]) {
            $sequence += 4;
            $outboundNumber = 'RH'.$sequence;
            $inboundNumber = 'RH'.($sequence + 1);

            for ($day = 0; $day < self::SCHEDULE_DAYS; $day++) {
                for ($slot = 0; $slot < $perDay; $slot++) {
                    $aircraft = $fleet[($day + $slot + $sequence) % $fleet->count()];

                    // Fares drift with lead time and time of day, the way a
                    // real revenue-management system would price them.
                    $leadFactor = 1 + max(0, (14 - $day)) * 0.02;
                    $slotFactor = $slot === 0 ? 0.88 : 1 + $slot * 0.06;
                    $price = (int) round($basePrice * $leadFactor * $slotFactor);

                    $departure = $today
                        ->addDays($day)
                        ->setTimeFromTimeString(self::SLOTS[$slot % count(self::SLOTS)]);

                    $flightRows[] = $this->row(
                        $outboundNumber, $aircraft->id, $hubId, $airports[$iata],
                        $departure, $minutes, $price
                    );

                    // The return leg turns around after a ground stop.
                    $returnDeparture = $departure->addMinutes($minutes + 95);

                    $flightRows[] = $this->row(
                        $inboundNumber, $aircraft->id, $airports[$iata], $hubId,
                        $returnDeparture, $minutes, $price
                    );
                }
            }
        }

        foreach (array_chunk($flightRows, 500) as $chunk) {
            DB::table('flights')->insert($chunk);
        }

        $this->seedFareClasses();
    }

    private function row(
        string $number,
        int $aircraftId,
        int $originId,
        int $destinationId,
        CarbonImmutable $departure,
        int $minutes,
        int $price,
    ): array {
        return [
            'flight_number' => $number,
            'aircraft_id' => $aircraftId,
            'origin_airport_id' => $originId,
            'destination_airport_id' => $destinationId,
            'departure_at' => $departure->toDateTimeString(),
            'arrival_at' => $departure->addMinutes($minutes)->toDateTimeString(),
            'duration_minutes' => $minutes,
            'base_price' => $price,
            'stops' => 0,
            'status' => 'scheduled',
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    /**
     * Builds the cabin inventory for every flight.
     *
     * Wide-bodies sell four cabins; narrow-bodies only economy and business.
     */
    private function seedFareClasses(): void
    {
        $fleet = Aircraft::all()->keyBy('id');
        $rows = [];

        DB::table('flights')
            ->select('id', 'aircraft_id', 'base_price')
            ->orderBy('id')
            ->chunk(1000, function ($flights) use ($fleet, &$rows) {
                foreach ($flights as $flight) {
                    $aircraft = $fleet[$flight->aircraft_id];
                    $wideBody = $aircraft->rows_economy >= 30;

                    $cabins = [
                        'economy' => [
                            $flight->base_price,
                            $aircraft->rows_economy * $aircraft->seats_per_row,
                        ],
                        'business' => [
                            (int) round($flight->base_price * 2.8),
                            $aircraft->rows_business * $aircraft->seats_per_row,
                        ],
                    ];

                    if ($wideBody) {
                        $cabins['premium'] = [
                            (int) round($flight->base_price * 1.6),
                            4 * $aircraft->seats_per_row,
                        ];
                        $cabins['first'] = [
                            (int) round($flight->base_price * 4.5),
                            8,
                        ];
                    }

                    foreach ($cabins as $cabin => [$price, $total]) {
                        $rows[] = [
                            'flight_id' => $flight->id,
                            'cabin' => $cabin,
                            'price' => $price,
                            'seats_total' => $total,
                            // Leave most inventory open, with realistic variance.
                            'seats_available' => (int) round($total * random_int(45, 96) / 100),
                            'created_at' => now(),
                            'updated_at' => now(),
                        ];
                    }
                }

                foreach (array_chunk($rows, 800) as $chunk) {
                    DB::table('fare_classes')->insert($chunk);
                }
                $rows = [];
            });
    }
}
