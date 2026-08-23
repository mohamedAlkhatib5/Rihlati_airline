<?php

namespace Database\Seeders;

use App\Models\Aircraft;
use App\Models\Booking;
use App\Models\BookingSegment;
use App\Models\FareClass;
use App\Models\Flight;
use App\Models\Offer;
use App\Models\Passenger;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BookingSeeder extends Seeder
{
    private const BOOKING_COUNT = 90;

    private const FIRST_NAMES = [
        'Omar', 'Layla', 'Yousef', 'Sara', 'Kareem', 'Nour', 'Hassan', 'Maya',
        'Adam', 'Rana', 'Tarek', 'Dina', 'Samir', 'Hala', 'Ziad', 'Farah',
        'Bilal', 'Salma', 'Rami', 'Jana', 'Marwan', 'Lina', 'Fadi', 'Reem',
    ];

    private const LAST_NAMES = [
        'Haddad', 'Nasser', 'Karim', 'Mansour', 'Fadel', 'Sabbagh', 'Darwish',
        'Khalil', 'Rahal', 'Aziz', 'Hamdan', 'Shaheen', 'Barakat', 'Chalhoub',
        'Zaher', 'Tannous', 'Ghanem', 'Sultan',
    ];

    /** Seats already taken per flight, so the unique index is never violated. */
    private array $takenSeats = [];

    public function run(): void
    {
        $customers = User::where('role', User::ROLE_CUSTOMER)->pluck('id')->all();
        $offers = Offer::pluck('id')->all();
        $aircraft = Aircraft::all()->keyBy('id');

        // Only future, sellable flights are worth booking against.
        $flights = Flight::query()
            ->bookable()
            ->where('departure_at', '>', now())
            ->with('fareClasses')
            ->inRandomOrder()
            ->limit(self::BOOKING_COUNT * 2)
            ->get();

        if ($flights->isEmpty()) {
            return;
        }

        for ($i = 0; $i < self::BOOKING_COUNT; $i++) {
            DB::transaction(function () use ($i, $flights, $customers, $offers, $aircraft) {
                $this->createBooking($i, $flights, $customers, $offers, $aircraft);
            });
        }
    }

    private function createBooking(int $index, $flights, array $customers, array $offers, $aircraft): void
    {
        $outbound = $flights->random();
        $fareClass = $outbound->fareClasses->random();
        $isRoundTrip = random_int(1, 100) <= 65;

        // The return leg must fly the opposite direction and depart later.
        $inbound = $isRoundTrip
            ? $flights->first(fn (Flight $flight) => $flight->origin_airport_id === $outbound->destination_airport_id
                && $flight->destination_airport_id === $outbound->origin_airport_id
                && $flight->departure_at->greaterThan($outbound->arrival_at))
            : null;

        $passengerCount = random_int(1, 3);
        $legs = $inbound ? 2 : 1;
        $subtotal = $fareClass->price * $passengerCount * $legs;

        $offerId = random_int(1, 100) <= 30 ? $offers[array_rand($offers)] : null;
        $discount = $offerId ? (int) round($subtotal * random_int(8, 22) / 100) : 0;

        $status = $this->pickStatus();
        $createdAt = now()->subDays(random_int(0, 60))->subHours(random_int(0, 23));

        $booking = Booking::create([
            'pnr' => Booking::generatePnr(),
            'user_id' => random_int(1, 100) <= 75 ? $customers[array_rand($customers)] : null,
            'offer_id' => $offerId,
            'contact_email' => 'traveller'.($index + 1).'@example.com',
            'contact_phone' => '+971 50 '.random_int(1000, 9999).' '.random_int(100, 999),
            'trip_type' => $inbound ? 'round' : 'one',
            'status' => $status,
            'subtotal_amount' => $subtotal,
            'discount_amount' => $discount,
            'total_amount' => $subtotal - $discount,
            'currency' => 'USD',
            'created_at' => $createdAt,
            'updated_at' => $createdAt,
        ]);

        $travellers = $this->buildTravellers($passengerCount);

        $this->addSegment($booking, $outbound, $fareClass, 'outbound', $travellers, $aircraft, $status);

        if ($inbound) {
            $returnFare = $inbound->fareClasses
                ->firstWhere('cabin', $fareClass->cabin) ?? $inbound->fareClasses->first();

            $this->addSegment($booking, $inbound, $returnFare, 'return', $travellers, $aircraft, $status);
        }

        if (in_array($status, ['confirmed', 'completed'], true)) {
            Payment::create([
                'booking_id' => $booking->id,
                'amount' => $booking->total_amount,
                'currency' => 'USD',
                'method' => 'card',
                'card_brand' => ['Visa', 'Mastercard', 'Amex'][random_int(0, 2)],
                'card_last4' => str_pad((string) random_int(0, 9999), 4, '0', STR_PAD_LEFT),
                'status' => 'paid',
                'reference' => Payment::generateReference(),
                'paid_at' => $createdAt->copy()->addMinutes(random_int(1, 30)),
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);
        }
    }

    private function addSegment(
        Booking $booking,
        Flight $flight,
        FareClass $fareClass,
        string $direction,
        array $travellers,
        $aircraft,
        string $status,
    ): void {
        $segment = BookingSegment::create([
            'booking_id' => $booking->id,
            'flight_id' => $flight->id,
            'fare_class_id' => $fareClass->id,
            'direction' => $direction,
        ]);

        foreach ($travellers as $traveller) {
            Passenger::create([
                'booking_id' => $booking->id,
                'booking_segment_id' => $segment->id,
                'flight_id' => $flight->id,
                'first_name' => $traveller['first_name'],
                'last_name' => $traveller['last_name'],
                'type' => $traveller['type'],
                'passport_number' => $traveller['passport_number'],
                'date_of_birth' => $traveller['date_of_birth'],
                'seat_number' => $this->allocateSeat(
                    $flight->id,
                    $fareClass->cabin,
                    $aircraft[$flight->aircraft_id],
                ),
                'checked_in' => $status === 'completed',
            ]);
        }
    }

    private function buildTravellers(int $count): array
    {
        $travellers = [];

        for ($i = 0; $i < $count; $i++) {
            $isChild = $i > 0 && random_int(1, 100) <= 25;

            $travellers[] = [
                'first_name' => self::FIRST_NAMES[array_rand(self::FIRST_NAMES)],
                'last_name' => self::LAST_NAMES[array_rand(self::LAST_NAMES)],
                'type' => $isChild ? 'child' : 'adult',
                'passport_number' => strtoupper(substr(md5(uniqid('', true)), 0, 9)),
                'date_of_birth' => now()
                    ->subYears($isChild ? random_int(3, 14) : random_int(19, 62))
                    ->subDays(random_int(0, 364))
                    ->toDateString(),
            ];
        }

        return $travellers;
    }

    /**
     * Picks the next free seat in the requested cabin.
     *
     * Business and first sit at the front of the aircraft; economy starts at
     * row 11, which is how cabins are laid out in practice.
     */
    private function allocateSeat(int $flightId, string $cabin, Aircraft $aircraft): ?string
    {
        $letters = array_slice(['A', 'B', 'C', 'D', 'E', 'F'], 0, $aircraft->seats_per_row);

        [$firstRow, $lastRow] = match ($cabin) {
            'first' => [1, 2],
            'business' => [3, 2 + $aircraft->rows_business],
            'premium' => [9, 12],
            default => [14, 13 + $aircraft->rows_economy],
        };

        for ($row = $firstRow; $row <= $lastRow; $row++) {
            foreach ($letters as $letter) {
                $seat = $row.$letter;

                if (! isset($this->takenSeats[$flightId][$seat])) {
                    $this->takenSeats[$flightId][$seat] = true;

                    return $seat;
                }
            }
        }

        return null;
    }

    private function pickStatus(): string
    {
        $roll = random_int(1, 100);

        return match (true) {
            $roll <= 62 => 'confirmed',
            $roll <= 80 => 'completed',
            $roll <= 92 => 'pending',
            default => 'cancelled',
        };
    }
}
