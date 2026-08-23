<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\FlightResource;
use App\Models\Airport;
use App\Models\Flight;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FlightSearchController extends Controller
{
    private const SORTS = ['price', 'duration', 'departure'];

    /**
     * Searches the schedule.
     *
     * Accepts either IATA codes or city names for `from`/`to`, because the
     * booking form lets people type a city.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $data = $request->validate([
            'from' => ['required', 'string', 'max:60'],
            'to' => ['required', 'string', 'max:60'],
            'departure' => ['required', 'date_format:Y-m-d'],
            'returnDate' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:departure'],
            'passengers' => ['nullable', 'integer', 'min:1', 'max:9'],
            'cabin' => ['nullable', 'in:economy,premium,business,first'],
            'sort' => ['nullable', 'in:'.implode(',', self::SORTS)],
            'maxPrice' => ['nullable', 'integer', 'min:0'],
            'maxStops' => ['nullable', 'integer', 'min:0', 'max:3'],
        ]);

        $origin = $this->resolveAirport($data['from']);
        $destination = $this->resolveAirport($data['to']);

        if (! $origin || ! $destination) {
            return response()->json([
                'message' => 'We do not fly from or to that city yet.',
                'data' => ['outbound' => [], 'return' => []],
            ], 200);
        }

        $passengers = (int) ($data['passengers'] ?? 1);

        $outbound = $this->legQuery($origin->id, $destination->id, $data['departure'], $data, $passengers);

        $return = ! empty($data['returnDate'])
            ? $this->legQuery($destination->id, $origin->id, $data['returnDate'], $data, $passengers)
            : collect();

        return response()->json([
            'data' => [
                'outbound' => FlightResource::collection($outbound)->resolve(),
                'return' => FlightResource::collection($return)->resolve(),
            ],
            'meta' => [
                'origin' => $origin->iata,
                'destination' => $destination->iata,
                'passengers' => $passengers,
                'outboundCount' => $outbound->count(),
                'returnCount' => $return->count(),
            ],
        ]);
    }

    private function resolveAirport(string $term): ?Airport
    {
        $term = trim($term);

        return Airport::query()
            ->where('iata', strtoupper($term))
            ->orWhere('city_en', 'like', $term.'%')
            ->orWhere('city_ar', 'like', $term.'%')
            ->first();
    }

    private function legQuery(int $originId, int $destinationId, string $date, array $filters, int $passengers)
    {
        return Flight::query()
            ->bookable()
            ->onRoute($originId, $destinationId)
            ->departingOn($date)
            ->when(
                isset($filters['maxStops']),
                fn ($query) => $query->where('stops', '<=', $filters['maxStops'])
            )
            // Only surface flights that can actually seat the whole party.
            ->whereHas('fareClasses', function ($query) use ($filters, $passengers) {
                $query->where('seats_available', '>=', $passengers);

                if (! empty($filters['cabin'])) {
                    $query->where('cabin', $filters['cabin']);
                }
                if (isset($filters['maxPrice'])) {
                    $query->where('price', '<=', $filters['maxPrice']);
                }
            })
            ->with([
                'origin', 'destination', 'aircraft',
                'fareClasses' => function ($query) use ($filters, $passengers) {
                    $query->where('seats_available', '>=', $passengers);

                    if (! empty($filters['cabin'])) {
                        $query->where('cabin', $filters['cabin']);
                    }

                    $query->orderBy('price');
                },
            ])
            ->orderBy(match ($filters['sort'] ?? 'departure') {
                'price' => 'base_price',
                'duration' => 'duration_minutes',
                default => 'departure_at',
            })
            ->limit(40)
            ->get();
    }
}
