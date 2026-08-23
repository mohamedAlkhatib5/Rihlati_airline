<?php

namespace Database\Seeders;

use App\Models\Airport;
use App\Models\Destination;
use Illuminate\Database\Seeder;

class DestinationSeeder extends Seeder
{
    /**
     * Marketing entries, one per airport.
     *
     * Columns: slug, IATA, image asset, headline fare, region, featured.
     * `image` matches a file in client/src/assets/images.
     */
    private const DESTINATIONS = [
        ['dubai', 'DXB', 'dubai', 399, 'middle-east', true],
        ['london', 'LHR', 'london', 649, 'europe', true],
        ['paris', 'CDG', 'paris', 579, 'europe', true],
        ['istanbul', 'IST', 'istanbul', 459, 'europe', false],
        ['new-york', 'JFK', 'newyork', 899, 'americas', false],
        ['maldives', 'MLE', 'maldives', 729, 'asia', false],
        ['tokyo', 'HND', 'tokyo', 849, 'asia', false],
        ['rome', 'FCO', 'rome', 539, 'europe', false],
        ['barcelona', 'BCN', 'barcelona', 559, 'europe', false],
        ['cairo', 'CAI', 'cairo', 289, 'africa', false],
        ['riyadh', 'RUH', 'riyadh', 249, 'middle-east', false],
        ['doha', 'DOH', 'doha', 199, 'middle-east', false],
        ['amsterdam', 'AMS', 'amsterdam', 599, 'europe', false],
        ['singapore', 'SIN', 'singapore', 789, 'asia', false],
        ['bangkok', 'BKK', 'bangkok', 699, 'asia', false],
        ['kuala-lumpur', 'KUL', 'kualalumpur', 719, 'asia', false],
        ['casablanca', 'CMN', 'casablanca', 469, 'africa', false],
        ['athens', 'ATH', 'athens', 499, 'europe', false],
        ['vienna', 'VIE', 'vienna', 609, 'europe', false],
        ['zurich', 'ZRH', 'zurich', 669, 'europe', false],
        ['beirut', 'BEY', 'beirut', 279, 'middle-east', false],
        ['amman', 'AMM', 'amman', 259, 'middle-east', false],
        ['muscat', 'MCT', 'muscat', 189, 'middle-east', false],
        ['jeddah', 'JED', 'jeddah', 269, 'middle-east', false],
        ['toronto', 'YYZ', 'toronto', 949, 'americas', false],
    ];

    public function run(): void
    {
        $airports = Airport::pluck('id', 'iata');

        foreach (self::DESTINATIONS as $index => [$slug, $iata, $image, $price, $region, $featured]) {
            Destination::updateOrCreate(
                ['slug' => $slug],
                [
                    'airport_id' => $airports[$iata],
                    'image' => $image,
                    'price_from' => $price,
                    'region' => $region,
                    'is_featured' => $featured,
                    'is_active' => true,
                    'sort_order' => $index,
                ]
            );
        }
    }
}
