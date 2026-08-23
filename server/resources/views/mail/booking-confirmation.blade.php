@component('mail::message')
# Your booking is confirmed

Thank you for choosing Rihlati Airlines. Keep your booking reference safe —
you will need it at check-in.

@component('mail::panel')
**Booking reference:** {{ $booking->pnr }}
@endcomponent

## Itinerary

@foreach ($booking->segments as $segment)
**{{ ucfirst($segment->direction) }} — {{ $segment->flight->flight_number }}**

- {{ $segment->flight->origin->city_en }} ({{ $segment->flight->origin->iata }})
  → {{ $segment->flight->destination->city_en }} ({{ $segment->flight->destination->iata }})
- Departs {{ $segment->flight->departure_at->format('D, d M Y · H:i') }}
- Arrives {{ $segment->flight->arrival_at->format('D, d M Y · H:i') }}

@endforeach

## Travellers

@foreach ($booking->passengers->unique('first_name') as $passenger)
- {{ $passenger->full_name }}@if ($passenger->seat_number) — seat {{ $passenger->seat_number }}@endif
@endforeach

## Payment

| | |
|:--|--:|
| Subtotal | ${{ number_format($booking->subtotal_amount) }} |
@if ($booking->discount_amount > 0)
| Discount | −${{ number_format($booking->discount_amount) }} |
@endif
| **Total paid** | **${{ number_format($booking->total_amount) }}** |

@component('mail::button', ['url' => config('app.frontend_url', 'http://localhost:5173').'/manage-booking'])
Manage your booking
@endcomponent

Safe travels,<br>
{{ config('app.name') }}
@endcomponent
