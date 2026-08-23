<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Aircraft extends Model
{
    use HasFactory;

    /** Laravel would pluralise this to "aircrafts". */
    protected $table = 'aircraft';

    protected $fillable = [
        'model', 'registration', 'rows_economy', 'rows_business',
        'seats_per_row', 'is_active',
    ];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function flights(): HasMany
    {
        return $this->hasMany(Flight::class);
    }

    /** Total seats the airframe can sell. */
    public function seatCount(): int
    {
        return ($this->rows_economy + $this->rows_business) * $this->seats_per_row;
    }
}
