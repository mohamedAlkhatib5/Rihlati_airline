<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\PassengerResource;
use App\Models\Flight;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ManifestController extends Controller
{
    /**
     * Everyone travelling on a flight, with their seat.
     *
     * Cancelled bookings are excluded by default — the manifest is the list of
     * people who will actually be on board.
     */
    public function show(Request $request, Flight $flight): JsonResponse
    {
        $passengers = $this->query($flight, $request->boolean('includeCancelled'))->get();

        $flight->load(['origin', 'destination', 'aircraft']);
        $capacity = $flight->aircraft->seatCount();

        return response()->json([
            'data' => [
                'flight' => [
                    'id' => $flight->id,
                    'flightNumber' => $flight->flight_number,
                    'status' => $flight->status,
                    'departureAt' => $flight->departure_at->format('Y-m-d\TH:i:s'),
                    'arrivalAt' => $flight->arrival_at->format('Y-m-d\TH:i:s'),
                    'route' => "{$flight->origin->iata}-{$flight->destination->iata}",
                    'origin' => ['iata' => $flight->origin->iata, 'city' => $flight->origin->city_en],
                    'destination' => ['iata' => $flight->destination->iata, 'city' => $flight->destination->city_en],
                    'aircraft' => $flight->aircraft->model,
                    'capacity' => $capacity,
                ],
                'summary' => [
                    'passengers' => $passengers->count(),
                    'checkedIn' => $passengers->where('checked_in', true)->count(),
                    'loadFactor' => $capacity > 0
                        ? round($passengers->count() / $capacity * 100, 1)
                        : 0,
                    'byCabin' => $passengers
                        ->groupBy(fn ($passenger) => $passenger->segment?->fareClass?->cabin ?? 'unknown')
                        ->map->count(),
                ],
                'passengers' => PassengerResource::collection($passengers)->resolve($request),
            ],
        ]);
    }

    /** The same manifest as a CSV download for ground staff. */
    public function export(Request $request, Flight $flight): StreamedResponse
    {
        $passengers = $this->query($flight, $request->boolean('includeCancelled'))->get();
        $flight->load(['origin', 'destination']);

        $filename = "manifest-{$flight->flight_number}-{$flight->departure_at->format('Y-m-d')}.csv";

        return response()->streamDownload(function () use ($passengers) {
            $handle = fopen('php://output', 'wb');

            fputcsv($handle, ['Seat', 'Last name', 'First name', 'Type', 'Cabin', 'PNR', 'Booking status', 'Checked in', 'Contact email']);

            foreach ($passengers as $passenger) {
                fputcsv($handle, [
                    $passenger->seat_number ?? '—',
                    $passenger->last_name,
                    $passenger->first_name,
                    $passenger->type,
                    $passenger->segment?->fareClass?->cabin ?? '—',
                    $passenger->booking->pnr,
                    $passenger->booking->status,
                    $passenger->checked_in ? 'yes' : 'no',
                    $passenger->booking->contact_email,
                ]);
            }

            fclose($handle);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    private function query(Flight $flight, bool $includeCancelled)
    {
        return $flight->passengers()
            ->with(['booking', 'segment.fareClass'])
            ->when(
                ! $includeCancelled,
                fn ($query) => $query->whereHas(
                    'booking',
                    fn ($booking) => $booking->where('status', '!=', 'cancelled')
                )
            )
            ->orderByRaw('CAST(seat_number AS UNSIGNED), seat_number');
    }
}
