<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\BookingResource;
use App\Mail\BookingConfirmation;
use App\Models\Booking;
use App\Models\Flight;
use App\Services\BookingService;
use App\Services\SeatAllocator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class BookingController extends Controller
{
    public function __construct(
        private readonly BookingService $bookings,
        private readonly SeatAllocator $seats,
    ) {}

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'outboundFareId' => ['required', 'integer', 'exists:fare_classes,id'],
            'returnFareId' => ['nullable', 'integer', 'exists:fare_classes,id'],
            'contactEmail' => ['required', 'email', 'max:191'],
            'contactPhone' => ['nullable', 'string', 'max:32'],
            'offerCode' => ['nullable', 'string', 'max:24'],
            'passengers' => ['required', 'array', 'min:1', 'max:9'],
            'passengers.*.firstName' => ['required', 'string', 'max:60'],
            'passengers.*.lastName' => ['required', 'string', 'max:60'],
            'passengers.*.type' => ['nullable', 'in:adult,child,infant'],
            'passengers.*.passportNumber' => ['nullable', 'string', 'max:20'],
            'passengers.*.dateOfBirth' => ['nullable', 'date', 'before:today'],
            'payment.method' => ['nullable', 'in:card,wallet,transfer'],
            'payment.cardBrand' => ['nullable', 'string', 'max:20'],
            'payment.cardLast4' => ['nullable', 'digits:4'],
        ]);

        $booking = $this->bookings->create($data, $request->user());

        $this->sendConfirmation($booking);

        return response()->json([
            'message' => 'Your booking is confirmed. A confirmation email is on its way.',
            'data' => new BookingResource($booking),
        ], 201);
    }

    /**
     * Looks a booking up by reference.
     *
     * The contact email must match: the PNR alone is short enough to guess, so
     * it is not treated as a secret.
     */
    public function show(Request $request, string $pnr): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $booking = Booking::where('pnr', strtoupper($pnr))
            ->where('contact_email', $data['email'])
            ->with([
                'segments.flight.origin',
                'segments.flight.destination',
                'segments.fareClass',
                'passengers',
                'payments',
                'offer',
            ])
            ->first();

        if (! $booking) {
            return response()->json([
                'message' => 'No booking matches that reference and email address.',
            ], 404);
        }

        return response()->json(['data' => new BookingResource($booking)]);
    }

    public function cancel(Request $request, string $pnr): JsonResponse
    {
        $data = $request->validate(['email' => ['required', 'email']]);

        $booking = Booking::where('pnr', strtoupper($pnr))
            ->where('contact_email', $data['email'])
            ->firstOrFail();

        if ($booking->status === 'cancelled') {
            return response()->json(['message' => 'This booking is already cancelled.'], 422);
        }

        return response()->json([
            'message' => 'Your booking has been cancelled and the payment refunded.',
            'data' => new BookingResource($this->bookings->cancel($booking)),
        ]);
    }

    /** Seat map for a flight and cabin, used by the seat picker. */
    public function seatMap(Request $request, Flight $flight): JsonResponse
    {
        $cabin = $request->validate([
            'cabin' => ['required', 'in:economy,premium,business,first'],
        ])['cabin'];

        return response()->json([
            'data' => [
                'flightNumber' => $flight->flight_number,
                'cabin' => $cabin,
                'seatsPerRow' => $flight->aircraft->seats_per_row,
                'seats' => $this->seats->seatMap($flight->load('aircraft'), $cabin),
            ],
        ]);
    }

    /**
     * Email must never break a paid booking, so a mail failure is logged and
     * the confirmed reservation is still returned to the traveller.
     */
    private function sendConfirmation(Booking $booking): void
    {
        try {
            Mail::send(new BookingConfirmation($booking));
        } catch (\Throwable $exception) {
            Log::warning('Booking confirmation email failed', [
                'pnr' => $booking->pnr,
                'error' => $exception->getMessage(),
            ]);
        }
    }
}
