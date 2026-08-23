<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\BookingSegment;
use App\Models\FareClass;
use App\Models\Offer;
use App\Models\Passenger;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Creates reservations.
 *
 * All of it runs inside one transaction, and inventory is decremented with a
 * conditional update, so two people booking the last seat at the same moment
 * cannot both succeed.
 */
class BookingService
{
    public function __construct(private readonly SeatAllocator $seats) {}

    /**
     * @param  array{
     *   outboundFareId:int, returnFareId?:int|null, contactEmail:string,
     *   contactPhone?:string|null, offerCode?:string|null,
     *   passengers: list<array{firstName:string,lastName:string,type?:string,passportNumber?:string|null,dateOfBirth?:string|null}>,
     *   payment?: array{method?:string, cardBrand?:string|null, cardLast4?:string|null}
     * }  $input
     */
    public function create(array $input, ?User $user = null): Booking
    {
        return DB::transaction(function () use ($input, $user) {
            $passengerCount = count($input['passengers']);

            $outbound = $this->lockFare($input['outboundFareId'], $passengerCount);
            $return = ! empty($input['returnFareId'])
                ? $this->lockFare($input['returnFareId'], $passengerCount)
                : null;

            $subtotal = $outbound->price * $passengerCount
                + ($return ? $return->price * $passengerCount : 0);

            [$offer, $discount] = $this->applyOffer($input['offerCode'] ?? null, $subtotal);

            $booking = Booking::create([
                'pnr' => Booking::generatePnr(),
                'user_id' => $user?->id,
                'offer_id' => $offer?->id,
                'contact_email' => $input['contactEmail'],
                'contact_phone' => $input['contactPhone'] ?? null,
                'trip_type' => $return ? 'round' : 'one',
                'status' => 'pending',
                'subtotal_amount' => $subtotal,
                'discount_amount' => $discount,
                'total_amount' => $subtotal - $discount,
                'currency' => 'USD',
            ]);

            $this->addSegment($booking, $outbound, 'outbound', $input['passengers']);

            if ($return) {
                $this->addSegment($booking, $return, 'return', $input['passengers']);
            }

            $this->recordPayment($booking, $input['payment'] ?? []);

            if ($offer) {
                $offer->increment('used_count');
            }

            return $booking->fresh([
                'segments.flight.origin',
                'segments.flight.destination',
                'segments.fareClass',
                'passengers',
                'payments',
                'offer',
            ]);
        });
    }

    /**
     * Reserves inventory for a fare class.
     *
     * The conditional `where` is the lock: if another request took the seats
     * first, zero rows are updated and we refuse rather than oversell.
     */
    private function lockFare(int $fareClassId, int $passengers): FareClass
    {
        $fare = FareClass::with('flight.aircraft')->find($fareClassId);

        if (! $fare) {
            throw ValidationException::withMessages([
                'outboundFareId' => 'That fare is no longer available.',
            ]);
        }

        $reserved = FareClass::where('id', $fare->id)
            ->where('seats_available', '>=', $passengers)
            ->decrement('seats_available', $passengers);

        if ($reserved === 0) {
            throw ValidationException::withMessages([
                'outboundFareId' => 'There are no longer enough seats in this cabin.',
            ]);
        }

        return $fare->refresh();
    }

    private function applyOffer(?string $code, int $subtotal): array
    {
        if (! $code) {
            return [null, 0];
        }

        $offer = Offer::redeemable()
            ->whereRaw('UPPER(code) = ?', [strtoupper($code)])
            ->first();

        if (! $offer) {
            throw ValidationException::withMessages([
                'offerCode' => 'That code is not valid or has expired.',
            ]);
        }

        return [$offer, $offer->discountFor($subtotal)];
    }

    private function addSegment(Booking $booking, FareClass $fare, string $direction, array $people): void
    {
        $segment = BookingSegment::create([
            'booking_id' => $booking->id,
            'flight_id' => $fare->flight_id,
            'fare_class_id' => $fare->id,
            'direction' => $direction,
        ]);

        $seats = $this->seats->allocate($fare->flight, $fare->cabin, count($people));

        foreach ($people as $index => $person) {
            Passenger::create([
                'booking_id' => $booking->id,
                'booking_segment_id' => $segment->id,
                'flight_id' => $fare->flight_id,
                'first_name' => $person['firstName'],
                'last_name' => $person['lastName'],
                'type' => $person['type'] ?? 'adult',
                'passport_number' => $person['passportNumber'] ?? null,
                'date_of_birth' => $person['dateOfBirth'] ?? null,
                'seat_number' => $seats[$index] ?? null,
            ]);
        }
    }

    /**
     * Records the payment and confirms the booking.
     *
     * This is a simulated gateway: no card number ever reaches the server, and
     * only the brand and last four digits are stored.
     */
    private function recordPayment(Booking $booking, array $payment): void
    {
        Payment::create([
            'booking_id' => $booking->id,
            'amount' => $booking->total_amount,
            'currency' => $booking->currency,
            'method' => $payment['method'] ?? 'card',
            'card_brand' => $payment['cardBrand'] ?? null,
            'card_last4' => $payment['cardLast4'] ?? null,
            'status' => 'paid',
            'reference' => Payment::generateReference(),
            'paid_at' => now(),
        ]);

        $booking->update(['status' => 'confirmed']);
    }

    public function cancel(Booking $booking): Booking
    {
        return DB::transaction(function () use ($booking) {
            foreach ($booking->segments as $segment) {
                $seatsHeld = $segment->passengers()->count();
                FareClass::where('id', $segment->fare_class_id)
                    ->increment('seats_available', $seatsHeld);
            }

            $booking->update(['status' => 'cancelled']);
            $booking->payments()->where('status', 'paid')->update(['status' => 'refunded']);

            return $booking->fresh();
        });
    }
}
