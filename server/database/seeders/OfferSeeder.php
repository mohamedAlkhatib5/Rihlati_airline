<?php

namespace Database\Seeders;

use App\Models\Destination;
use App\Models\Offer;
use Illuminate\Database\Seeder;

class OfferSeeder extends Seeder
{
    /**
     * Columns: code, title (en/ar), description (en/ar), destination slug or
     * null for network-wide, discount type, value, days valid, max uses.
     */
    private const OFFERS = [
        ['SUMMER25', 'Summer escape', 'عرض الصيف',
            'Save 25% on summer departures across the network.',
            'وفّر 25% على رحلات الصيف في جميع الوجهات.',
            null, 'percent', 25, 90, 500],
        ['LONDON120', 'London city break', 'عطلة لندن',
            'Flat $120 off return fares to London.',
            'خصم 120 دولاراً على رحلات الذهاب والعودة إلى لندن.',
            'london', 'fixed', 120, 60, 300],
        ['MALDIVES15', 'Island retreat', 'عطلة الجزر',
            '15% off Maldives fares in every cabin.',
            'خصم 15% على رحلات المالديف بجميع الدرجات.',
            'maldives', 'percent', 15, 75, 200],
        ['GULF10', 'Gulf hopper', 'رحلات الخليج',
            '10% off short Gulf routes booked in advance.',
            'خصم 10% على رحلات الخليج القصيرة عند الحجز المبكر.',
            'doha', 'percent', 10, 120, null],
        ['TOKYO200', 'Tokyo discovery', 'اكتشف طوكيو',
            'Save $200 on business class to Tokyo.',
            'وفّر 200 دولار على درجة رجال الأعمال إلى طوكيو.',
            'tokyo', 'fixed', 200, 45, 120],
        ['FIRSTTRIP', 'First journey', 'رحلتك الأولى',
            '12% off your first booking with Rihlati.',
            'خصم 12% على أول حجز لك مع رحلتي.',
            null, 'percent', 12, 180, 1000],
        ['PARIS90', 'Paris in bloom', 'باريس في الربيع',
            '$90 off return fares to Paris.',
            'خصم 90 دولاراً على رحلات الذهاب والعودة إلى باريس.',
            'paris', 'fixed', 90, 50, 250],
        ['ASIA20', 'Asia explorer', 'استكشف آسيا',
            '20% off Bangkok, Singapore and Kuala Lumpur.',
            'خصم 20% على بانكوك وسنغافورة وكوالالمبور.',
            'bangkok', 'percent', 20, 70, 400],
    ];

    public function run(): void
    {
        $destinations = Destination::pluck('id', 'slug');

        foreach (self::OFFERS as [$code, $titleEn, $titleAr, $descEn, $descAr, $slug, $type, $value, $days, $maxUses]) {
            Offer::updateOrCreate(
                ['code' => $code],
                [
                    'title_en' => $titleEn,
                    'title_ar' => $titleAr,
                    'description_en' => $descEn,
                    'description_ar' => $descAr,
                    'destination_id' => $slug ? $destinations[$slug] : null,
                    'discount_type' => $type,
                    'discount_value' => $value,
                    'valid_from' => now()->subDays(5)->toDateString(),
                    'valid_to' => now()->addDays($days)->toDateString(),
                    'max_uses' => $maxUses,
                    'used_count' => random_int(0, 40),
                    'is_active' => true,
                ]
            );
        }
    }
}
