<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PassengerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'firstName' => $this->first_name,
            'lastName' => $this->last_name,
            'fullName' => $this->full_name,
            'type' => $this->type,
            'seatNumber' => $this->seat_number,
            'checkedIn' => (bool) $this->checked_in,
            'passportNumber' => $this->when(
                $request->user()?->canAccessDashboard(),
                $this->passport_number
            ),
            'booking' => $this->whenLoaded('booking', fn () => [
                'pnr' => $this->booking->pnr,
                'status' => $this->booking->status,
                'contactEmail' => $this->booking->contact_email,
            ]),
            'cabin' => $this->whenLoaded('segment', fn () => $this->segment->fareClass?->cabin),
        ];
    }
}
