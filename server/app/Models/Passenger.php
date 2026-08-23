<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Passenger extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id', 'booking_segment_id', 'flight_id', 'first_name', 'last_name',
        'type', 'passport_number', 'date_of_birth', 'seat_number', 'checked_in',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'checked_in' => 'boolean',
        ];
    }

    protected function fullName(): Attribute
    {
        return Attribute::get(fn () => trim("{$this->first_name} {$this->last_name}"));
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function segment(): BelongsTo
    {
        return $this->belongsTo(BookingSegment::class, 'booking_segment_id');
    }

    public function flight(): BelongsTo
    {
        return $this->belongsTo(Flight::class);
    }
}
