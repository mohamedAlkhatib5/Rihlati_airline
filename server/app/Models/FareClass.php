<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FareClass extends Model
{
    use HasFactory;

    protected $fillable = [
        'flight_id', 'cabin', 'price', 'seats_total', 'seats_available',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'integer',
            'seats_total' => 'integer',
            'seats_available' => 'integer',
        ];
    }

    public function flight(): BelongsTo
    {
        return $this->belongsTo(Flight::class);
    }

    public function hasSeatsFor(int $passengers): bool
    {
        return $this->seats_available >= $passengers;
    }
}
