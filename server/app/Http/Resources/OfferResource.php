<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OfferResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'title' => ['en' => $this->title_en, 'ar' => $this->title_ar],
            'description' => ['en' => $this->description_en, 'ar' => $this->description_ar],
            'discountType' => $this->discount_type,
            'discountValue' => $this->discount_value,
            'validFrom' => $this->valid_from?->toDateString(),
            'validTo' => $this->valid_to?->toDateString(),
            'isActive' => (bool) $this->is_active,
            'destination' => $this->whenLoaded('destination', fn () => $this->destination ? [
                'id' => $this->destination->slug,
                'image' => $this->destination->image,
                'priceFrom' => $this->destination->price_from,
                'city' => [
                    'en' => $this->destination->airport->city_en,
                    'ar' => $this->destination->airport->city_ar,
                ],
            ] : null),
        ];
    }
}
