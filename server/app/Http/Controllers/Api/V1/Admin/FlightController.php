<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\FlightResource;
use App\Models\AuditLog;
use App\Models\Flight;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FlightController extends Controller
{
    private const RELATIONS = ['origin', 'destination', 'aircraft', 'fareClasses'];

    /** Paginated, searchable schedule for the dashboard table. */
    public function index(Request $request): JsonResponse
    {
        $flights = Flight::query()
            ->with(self::RELATIONS)
            ->withCount('passengers')
            ->when($request->filled('q'), function ($query) use ($request) {
                $term = trim($request->string('q'));
                $query->where(function ($inner) use ($term) {
                    $inner->where('flight_number', 'like', "%{$term}%")
                        ->orWhereHas('origin', fn ($a) => $a->where('iata', 'like', "%{$term}%")
                            ->orWhere('city_en', 'like', "%{$term}%"))
                        ->orWhereHas('destination', fn ($a) => $a->where('iata', 'like', "%{$term}%")
                            ->orWhere('city_en', 'like', "%{$term}%"));
                });
            })
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->when($request->filled('date'), fn ($q) => $q->whereDate('departure_at', $request->string('date')))
            ->when($request->filled('from'), fn ($q) => $q->whereHas('origin', fn ($a) => $a->where('iata', strtoupper($request->string('from')))))
            ->orderBy($request->string('sort', 'departure_at')->toString(), $request->string('direction', 'asc')->toString())
            ->paginate(min($request->integer('perPage', 20), 100));

        return response()->json([
            'data' => FlightResource::collection($flights->items())->resolve(),
            'meta' => [
                'currentPage' => $flights->currentPage(),
                'lastPage' => $flights->lastPage(),
                'perPage' => $flights->perPage(),
                'total' => $flights->total(),
            ],
        ]);
    }

    public function show(Flight $flight): JsonResponse
    {
        return response()->json([
            'data' => new FlightResource($flight->load(self::RELATIONS)),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);

        $flight = DB::transaction(function () use ($data, $request) {
            $flight = Flight::create($this->attributes($data));
            $this->syncFares($flight, $data['fares']);

            AuditLog::record(
                $request->user()->id, 'created', 'flight', $flight->id,
                ['flightNumber' => $flight->flight_number], $request->ip()
            );

            return $flight;
        });

        return response()->json([
            'message' => "Flight {$flight->flight_number} created.",
            'data' => new FlightResource($flight->load(self::RELATIONS)),
        ], 201);
    }

    public function update(Request $request, Flight $flight): JsonResponse
    {
        $data = $this->validated($request, $flight);

        DB::transaction(function () use ($data, $flight, $request) {
            $flight->update($this->attributes($data));

            if (! empty($data['fares'])) {
                $this->syncFares($flight, $data['fares']);
            }

            AuditLog::record(
                $request->user()->id, 'updated', 'flight', $flight->id,
                ['flightNumber' => $flight->flight_number], $request->ip()
            );
        });

        return response()->json([
            'message' => "Flight {$flight->flight_number} updated.",
            'data' => new FlightResource($flight->fresh(self::RELATIONS)),
        ]);
    }

    /**
     * Deletes a flight.
     *
     * Refused while travellers are booked on it — cancelling the flight is the
     * correct action there, so the reservations are not silently destroyed.
     */
    public function destroy(Request $request, Flight $flight): JsonResponse
    {
        if ($flight->segments()->exists()) {
            return response()->json([
                'message' => 'This flight has bookings. Set its status to cancelled instead of deleting it.',
            ], 422);
        }

        $number = $flight->flight_number;

        AuditLog::record(
            $request->user()->id, 'deleted', 'flight', $flight->id,
            ['flightNumber' => $number], $request->ip()
        );

        $flight->delete();

        return response()->json(['message' => "Flight {$number} deleted."]);
    }

    private function validated(Request $request, ?Flight $flight = null): array
    {
        $required = $flight ? 'sometimes' : 'required';

        return $request->validate([
            'flightNumber' => [$required, 'string', 'max:8'],
            'aircraftId' => [$required, 'integer', 'exists:aircraft,id'],
            'originAirportId' => [$required, 'integer', 'exists:airports,id'],
            'destinationAirportId' => [$required, 'integer', 'exists:airports,id', 'different:originAirportId'],
            'departureAt' => [$required, 'date'],
            'arrivalAt' => [$required, 'date', 'after:departureAt'],
            'basePrice' => [$required, 'integer', 'min:1', 'max:100000'],
            'stops' => ['nullable', 'integer', 'min:0', 'max:3'],
            'status' => ['nullable', 'in:scheduled,delayed,departed,arrived,cancelled'],
            'fares' => [$flight ? 'nullable' : 'required', 'array', 'min:1'],
            'fares.*.cabin' => ['required_with:fares', 'in:economy,premium,business,first'],
            'fares.*.price' => ['required_with:fares', 'integer', 'min:1'],
            'fares.*.seatsTotal' => ['required_with:fares', 'integer', 'min:1', 'max:900'],
        ]);
    }

    private function attributes(array $data): array
    {
        $attributes = array_filter([
            'flight_number' => $data['flightNumber'] ?? null,
            'aircraft_id' => $data['aircraftId'] ?? null,
            'origin_airport_id' => $data['originAirportId'] ?? null,
            'destination_airport_id' => $data['destinationAirportId'] ?? null,
            'departure_at' => $data['departureAt'] ?? null,
            'arrival_at' => $data['arrivalAt'] ?? null,
            'base_price' => $data['basePrice'] ?? null,
            'status' => $data['status'] ?? null,
        ], fn ($value) => $value !== null);

        if (isset($data['stops'])) {
            $attributes['stops'] = $data['stops'];
        }

        if (isset($attributes['departure_at'], $attributes['arrival_at'])) {
            $attributes['duration_minutes'] = Carbon::parse($attributes['departure_at'])
                ->diffInMinutes(Carbon::parse($attributes['arrival_at']));
        }

        return $attributes;
    }

    /**
     * Replaces the cabin inventory, preserving how many seats are already
     * sold so an edit cannot hand back seats that travellers hold.
     */
    private function syncFares(Flight $flight, array $fares): void
    {
        $existing = $flight->fareClasses()->get()->keyBy('cabin');

        foreach ($fares as $fare) {
            $current = $existing->get($fare['cabin']);
            $sold = $current ? $current->seats_total - $current->seats_available : 0;

            $flight->fareClasses()->updateOrCreate(
                ['cabin' => $fare['cabin']],
                [
                    'price' => $fare['price'],
                    'seats_total' => $fare['seatsTotal'],
                    'seats_available' => max(0, $fare['seatsTotal'] - $sold),
                ]
            );
        }
    }
}
