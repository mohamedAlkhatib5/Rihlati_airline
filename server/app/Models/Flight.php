<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Flight extends Model
{
    use HasFactory;

    protected $fillable = [
        'flight_number', 'aircraft_id', 'origin_airport_id', 'destination_airport_id',
        'departure_at', 'arrival_at', 'duration_minutes', 'base_price', 'stops', 'status',
    ];

    protected function casts(): array
    {
        return [
            'departure_at' => 'datetime',
            'arrival_at' => 'datetime',
            'base_price' => 'integer',
            'duration_minutes' => 'integer',
            'stops' => 'integer',
        ];
    }

    public function aircraft(): BelongsTo
    {
        return $this->belongsTo(Aircraft::class);
    }

    public function origin(): BelongsTo
    {
        return $this->belongsTo(Airport::class, 'origin_airport_id');
    }

    public function destination(): BelongsTo
    {
        return $this->belongsTo(Airport::class, 'destination_airport_id');
    }

    public function fareClasses(): HasMany
    {
        return $this->hasMany(FareClass::class);
    }

    public function segments(): HasMany
    {
        return $this->hasMany(BookingSegment::class);
    }

    /** Everyone travelling on this flight, across every booking. */
    public function passengers()
    {
        return $this->hasManyThrough(
            Passenger::class,
            BookingSegment::class,
            'flight_id',
            'booking_segment_id'
        );
    }

    public function scopeBookable(Builder $query): Builder
    {
        return $query->whereIn('status', ['scheduled', 'delayed']);
    }

    public function scopeOnRoute(Builder $query, int $originId, int $destinationId): Builder
    {
        return $query
            ->where('origin_airport_id', $originId)
            ->where('destination_airport_id', $destinationId);
    }

    public function scopeDepartingOn(Builder $query, string $date): Builder
    {
        return $query->whereDate('departure_at', $date);
    }
}
