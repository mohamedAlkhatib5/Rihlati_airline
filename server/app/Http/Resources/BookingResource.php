<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'pnr' => $this->pnr,
            'status' => $this->status,
            'tripType' => $this->trip_type,
            'contactEmail' => $this->contact_email,
            'contactPhone' => $this->contact_phone,
            'currency' => $this->currency,
            'subtotalAmount' => $this->subtotal_amount,
            'discountAmount' => $this->discount_amount,
            'totalAmount' => $this->total_amount,
            'createdAt' => $this->created_at?->toIso8601String(),
            'offerCode' => $this->whenLoaded('offer', fn () => $this->offer?->code),
            'segments' => $this->whenLoaded('segments', fn () => $this->segments->map(fn ($segment) => [
                'id' => $segment->id,
                'direction' => $segment->direction,
                'cabin' => $segment->fareClass?->cabin,
                'flight' => new FlightResource($segment->flight),
            ])),
            'passengers' => PassengerResource::collection($this->whenLoaded('passengers')),
            'payment' => $this->whenLoaded('payments', fn () => $this->payments->map(fn ($payment) => [
                'reference' => $payment->reference,
                'status' => $payment->status,
                'amount' => $payment->amount,
                'method' => $payment->method,
                'cardBrand' => $payment->card_brand,
                'cardLast4' => $payment->card_last4,
                'paidAt' => $payment->paid_at?->toIso8601String(),
            ])->first()),
        ];
    }
}
