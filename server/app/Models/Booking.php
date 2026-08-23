<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'pnr', 'user_id', 'offer_id', 'contact_email', 'contact_phone',
        'trip_type', 'status', 'subtotal_amount', 'discount_amount',
        'total_amount', 'currency',
    ];

    protected function casts(): array
    {
        return [
            'subtotal_amount' => 'integer',
            'discount_amount' => 'integer',
            'total_amount' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function offer(): BelongsTo
    {
        return $this->belongsTo(Offer::class);
    }

    public function segments(): HasMany
    {
        return $this->hasMany(BookingSegment::class);
    }

    public function passengers(): HasMany
    {
        return $this->hasMany(Passenger::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Generates a booking reference.
     *
     * Ambiguous characters (0/O, 1/I) are excluded so a code read over the
     * phone or copied from a printout cannot be mistyped.
     */
    public static function generatePnr(): string
    {
        $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

        do {
            $pnr = '';
            for ($i = 0; $i < 6; $i++) {
                $pnr .= $alphabet[random_int(0, strlen($alphabet) - 1)];
            }
        } while (static::where('pnr', $pnr)->exists());

        return $pnr;
    }

    public function getRouteKeyName(): string
    {
        return 'pnr';
    }
}
