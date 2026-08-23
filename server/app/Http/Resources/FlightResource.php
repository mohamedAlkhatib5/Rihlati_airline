<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FlightResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'flightNumber' => $this->flight_number,
            // Schedules are published in the local time of each airport, so
            // these are emitted without an offset. Attaching one would make
            // the browser shift them into the viewer's own zone, which is not
            // what a departure board shows.
            'departureAt' => $this->departure_at->format('Y-m-d\TH:i:s'),
            'arrivalAt' => $this->arrival_at->format('Y-m-d\TH:i:s'),
            'durationMinutes' => $this->duration_minutes,
            'stops' => $this->stops,
            'status' => $this->status,
            'basePrice' => $this->base_price,
            'aircraft' => $this->whenLoaded('aircraft', fn () => [
                'model' => $this->aircraft->model,
                'registration' => $this->aircraft->registration,
            ]),
            'origin' => $this->whenLoaded('origin', fn () => $this->airport($this->origin)),
            'destination' => $this->whenLoaded('destination', fn () => $this->airport($this->destination)),
            'fares' => FareClassResource::collection($this->whenLoaded('fareClasses')),
        ];
    }

    private function airport($airport): array
    {
        return [
            'iata' => $airport->iata,
            'city' => ['en' => $airport->city_en, 'ar' => $airport->city_ar],
            'country' => ['en' => $airport->country_en, 'ar' => $airport->country_ar],
            'name' => ['en' => $airport->name_en, 'ar' => $airport->name_ar],
        ];
    }
}
