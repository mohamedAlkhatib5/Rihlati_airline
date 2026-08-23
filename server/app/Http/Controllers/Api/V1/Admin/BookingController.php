<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\BookingResource;
use App\Models\AuditLog;
use App\Models\Booking;
use App\Services\BookingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function __construct(private readonly BookingService $bookings) {}

    public function index(Request $request): JsonResponse
    {
        $bookings = Booking::query()
            ->with(['passengers', 'segments.flight.origin', 'segments.flight.destination'])
            ->when($request->filled('q'), function ($query) use ($request) {
                $term = trim($request->string('q'));
                $query->where(function ($inner) use ($term) {
                    $inner->where('pnr', 'like', "%{$term}%")
                        ->orWhere('contact_email', 'like', "%{$term}%")
                        ->orWhereHas('passengers', fn ($p) => $p
                            ->where('first_name', 'like', "%{$term}%")
                            ->orWhere('last_name', 'like', "%{$term}%"));
                });
            })
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->latest()
            ->paginate(min($request->integer('perPage', 20), 100));

        return response()->json([
            'data' => BookingResource::collection($bookings->items())->resolve($request),
            'meta' => [
                'currentPage' => $bookings->currentPage(),
                'lastPage' => $bookings->lastPage(),
                'perPage' => $bookings->perPage(),
                'total' => $bookings->total(),
            ],
        ]);
    }

    public function show(Request $request, Booking $booking): JsonResponse
    {
        $booking->load([
            'segments.flight.origin',
            'segments.flight.destination',
            'segments.fareClass',
            'passengers.segment.fareClass',
            'payments',
            'offer',
            'user',
        ]);

        return response()->json(['data' => new BookingResource($booking)]);
    }

    public function updateStatus(Request $request, Booking $booking): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:pending,confirmed,cancelled,completed'],
        ]);

        // Cancelling goes through the service so seats return to inventory and
        // the payment is refunded.
        if ($data['status'] === 'cancelled' && $booking->status !== 'cancelled') {
            $booking = $this->bookings->cancel($booking);
        } else {
            $booking->update(['status' => $data['status']]);
        }

        AuditLog::record(
            $request->user()->id, 'status-changed', 'booking', $booking->id,
            ['pnr' => $booking->pnr, 'status' => $data['status']], $request->ip()
        );

        return response()->json([
            'message' => "Booking {$booking->pnr} is now {$booking->status}.",
            'data' => new BookingResource($booking->fresh(['passengers', 'payments'])),
        ]);
    }
}
