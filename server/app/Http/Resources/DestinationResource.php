<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DestinationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->slug,
            'image' => $this->image,
            'iata' => $this->airport->iata,
            'priceFrom' => $this->price_from,
            'region' => $this->region,
            'featured' => (bool) $this->is_featured,
            'city' => [
                'en' => $this->airport->city_en,
                'ar' => $this->airport->city_ar,
            ],
            'country' => [
                'en' => $this->airport->country_en,
                'ar' => $this->airport->country_ar,
            ],
            'description' => [
                'en' => $this->description_en,
                'ar' => $this->description_ar,
            ],
        ];
    }
}
