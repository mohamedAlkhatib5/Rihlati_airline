<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FareClassResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'cabin' => $this->cabin,
            'price' => $this->price,
            'seatsAvailable' => $this->seats_available,
            'seatsTotal' => $this->seats_total,
        ];
    }
}
