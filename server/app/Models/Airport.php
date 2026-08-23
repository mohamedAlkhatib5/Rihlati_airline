<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Airport extends Model
{
    use HasFactory;

    protected $fillable = [
        'iata', 'name_en', 'name_ar', 'city_en', 'city_ar',
        'country_en', 'country_ar', 'timezone',
    ];

    public function destination(): HasOne
    {
        return $this->hasOne(Destination::class);
    }

    public function departures(): HasMany
    {
        return $this->hasMany(Flight::class, 'origin_airport_id');
    }

    public function arrivals(): HasMany
    {
        return $this->hasMany(Flight::class, 'destination_airport_id');
    }
}
