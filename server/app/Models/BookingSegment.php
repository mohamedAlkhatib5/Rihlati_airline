<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BookingSegment extends Model
{
    use HasFactory;

    protected $fillable = ['booking_id', 'flight_id', 'fare_class_id', 'direction'];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function flight(): BelongsTo
    {
        return $this->belongsTo(Flight::class);
    }

    public function fareClass(): BelongsTo
    {
        return $this->belongsTo(FareClass::class);
    }

    public function passengers(): HasMany
    {
        return $this->hasMany(Passenger::class);
    }
}
