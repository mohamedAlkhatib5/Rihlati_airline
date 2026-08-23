<?php

namespace App\Services;

use App\Models\Flight;
use App\Models\Passenger;

/**
 * Assigns seats on a flight.
 *
 * Cabins occupy fixed row ranges, matching how the cabin is physically laid
 * out: first at the nose, then business, premium, and economy from row 14.
 */
class SeatAllocator
{
    private const ROW_RANGES = [
        'first' => [1, 2],
        'business' => [3, null],   // Upper bound comes from the airframe.
        'premium' => [9, 12],
        'economy' => [14, null],
    ];

    /**
     * @return list<string> The seats taken so far on this flight.
     */
    public function occupiedSeats(int $flightId): array
    {
        return Passenger::where('flight_id', $flightId)
            ->whereNotNull('seat_number')
            ->pluck('seat_number')
            ->all();
    }

    /**
     * Every seat in a cabin, flagged with whether it is still free.
     *
     * @return list<array{seat: string, row: int, letter: string, available: bool}>
     */
    public function seatMap(Flight $flight, string $cabin): array
    {
        $taken = array_flip($this->occupiedSeats($flight->id));
        $map = [];

        foreach ($this->seatsFor($flight, $cabin) as [$row, $letter, $seat]) {
            $map[] = [
                'seat' => $seat,
                'row' => $row,
                'letter' => $letter,
                'available' => ! isset($taken[$seat]),
            ];
        }

        return $map;
    }

    /**
     * Picks the next free seats in a cabin.
     *
     * @param  list<string>  $alreadyClaimed  Seats reserved earlier in the same
     *                                        request but not yet persisted.
     * @return list<string|null>
     */
    public function allocate(Flight $flight, string $cabin, int $count, array $alreadyClaimed = []): array
    {
        $taken = array_flip([...$this->occupiedSeats($flight->id), ...$alreadyClaimed]);
        $seats = [];

        foreach ($this->seatsFor($flight, $cabin) as [, , $seat]) {
            if (count($seats) === $count) {
                break;
            }
            if (! isset($taken[$seat])) {
                $seats[] = $seat;
                $taken[$seat] = true;
            }
        }

        // A full cabin still produces a booking; the seat is assigned at
        // check-in instead of being refused here.
        return array_pad($seats, $count, null);
    }

    /** @return \Generator<array{0:int,1:string,2:string}> */
    private function seatsFor(Flight $flight, string $cabin): \Generator
    {
        $aircraft = $flight->aircraft;
        $letters = array_slice(['A', 'B', 'C', 'D', 'E', 'F'], 0, $aircraft->seats_per_row);

        [$firstRow, $lastRow] = self::ROW_RANGES[$cabin] ?? self::ROW_RANGES['economy'];

        $lastRow ??= match ($cabin) {
            'business' => 2 + $aircraft->rows_business,
            default => 13 + $aircraft->rows_economy,
        };

        for ($row = $firstRow; $row <= $lastRow; $row++) {
            foreach ($letters as $letter) {
                yield [$row, $letter, $row.$letter];
            }
        }
    }
}
