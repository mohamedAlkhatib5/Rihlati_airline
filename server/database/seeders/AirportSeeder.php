<?php

namespace Database\Seeders;

use App\Models\Airport;
use Illuminate\Database\Seeder;

class AirportSeeder extends Seeder
{
    /**
     * The network. Dubai is the hub every route connects through.
     *
     * Columns: IATA, airport name (en/ar), city (en/ar), country (en/ar), tz.
     */
    private const AIRPORTS = [
        ['DXB', 'Dubai International', 'مطار دبي الدولي', 'Dubai', 'دبي', 'United Arab Emirates', 'الإمارات العربية المتحدة', 'Asia/Dubai'],
        ['LHR', 'London Heathrow', 'مطار هيثرو', 'London', 'لندن', 'United Kingdom', 'المملكة المتحدة', 'Europe/London'],
        ['CDG', 'Paris Charles de Gaulle', 'مطار شارل ديغول', 'Paris', 'باريس', 'France', 'فرنسا', 'Europe/Paris'],
        ['IST', 'Istanbul Airport', 'مطار إسطنبول', 'Istanbul', 'إسطنبول', 'Türkiye', 'تركيا', 'Europe/Istanbul'],
        ['JFK', 'John F. Kennedy International', 'مطار جون كينيدي', 'New York', 'نيويورك', 'United States', 'الولايات المتحدة', 'America/New_York'],
        ['MLE', 'Velana International', 'مطار فيلانا الدولي', 'Malé', 'ماليه', 'Maldives', 'جزر المالديف', 'Indian/Maldives'],
        ['HND', 'Tokyo Haneda', 'مطار هانيدا', 'Tokyo', 'طوكيو', 'Japan', 'اليابان', 'Asia/Tokyo'],
        ['FCO', 'Rome Fiumicino', 'مطار فيوميتشينو', 'Rome', 'روما', 'Italy', 'إيطاليا', 'Europe/Rome'],
        ['BCN', 'Barcelona El Prat', 'مطار البرات', 'Barcelona', 'برشلونة', 'Spain', 'إسبانيا', 'Europe/Madrid'],
        ['CAI', 'Cairo International', 'مطار القاهرة الدولي', 'Cairo', 'القاهرة', 'Egypt', 'مصر', 'Africa/Cairo'],
        ['RUH', 'King Khalid International', 'مطار الملك خالد الدولي', 'Riyadh', 'الرياض', 'Saudi Arabia', 'السعودية', 'Asia/Riyadh'],
        ['DOH', 'Hamad International', 'مطار حمد الدولي', 'Doha', 'الدوحة', 'Qatar', 'قطر', 'Asia/Qatar'],
        ['AMS', 'Amsterdam Schiphol', 'مطار سخيبول', 'Amsterdam', 'أمستردام', 'Netherlands', 'هولندا', 'Europe/Amsterdam'],
        ['SIN', 'Singapore Changi', 'مطار شانغي', 'Singapore', 'سنغافورة', 'Singapore', 'سنغافورة', 'Asia/Singapore'],
        ['BKK', 'Suvarnabhumi', 'مطار سوفارنابومي', 'Bangkok', 'بانكوك', 'Thailand', 'تايلاند', 'Asia/Bangkok'],
        ['KUL', 'Kuala Lumpur International', 'مطار كوالالمبور الدولي', 'Kuala Lumpur', 'كوالالمبور', 'Malaysia', 'ماليزيا', 'Asia/Kuala_Lumpur'],
        ['CMN', 'Mohammed V International', 'مطار محمد الخامس', 'Casablanca', 'الدار البيضاء', 'Morocco', 'المغرب', 'Africa/Casablanca'],
        ['ATH', 'Athens International', 'مطار أثينا الدولي', 'Athens', 'أثينا', 'Greece', 'اليونان', 'Europe/Athens'],
        ['VIE', 'Vienna International', 'مطار فيينا الدولي', 'Vienna', 'فيينا', 'Austria', 'النمسا', 'Europe/Vienna'],
        ['ZRH', 'Zurich Airport', 'مطار زيورخ', 'Zurich', 'زيورخ', 'Switzerland', 'سويسرا', 'Europe/Zurich'],
        ['BEY', 'Beirut Rafic Hariri', 'مطار رفيق الحريري', 'Beirut', 'بيروت', 'Lebanon', 'لبنان', 'Asia/Beirut'],
        ['AMM', 'Queen Alia International', 'مطار الملكة علياء', 'Amman', 'عمّان', 'Jordan', 'الأردن', 'Asia/Amman'],
        ['MCT', 'Muscat International', 'مطار مسقط الدولي', 'Muscat', 'مسقط', 'Oman', 'عُمان', 'Asia/Muscat'],
        ['JED', 'King Abdulaziz International', 'مطار الملك عبدالعزيز', 'Jeddah', 'جدة', 'Saudi Arabia', 'السعودية', 'Asia/Riyadh'],
        ['YYZ', 'Toronto Pearson', 'مطار تورونتو بيرسون', 'Toronto', 'تورونتو', 'Canada', 'كندا', 'America/Toronto'],
    ];

    public function run(): void
    {
        foreach (self::AIRPORTS as [$iata, $nameEn, $nameAr, $cityEn, $cityAr, $countryEn, $countryAr, $tz]) {
            Airport::updateOrCreate(
                ['iata' => $iata],
                [
                    'name_en' => $nameEn,
                    'name_ar' => $nameAr,
                    'city_en' => $cityEn,
                    'city_ar' => $cityAr,
                    'country_en' => $countryEn,
                    'country_ar' => $countryAr,
                    'timezone' => $tz,
                ]
            );
        }
    }
}
