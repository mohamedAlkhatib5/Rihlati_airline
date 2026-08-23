<?php

namespace Database\Seeders;

use App\Models\ContactMessage;
use App\Models\NewsletterSubscriber;
use Illuminate\Database\Seeder;

class SupportSeeder extends Seeder
{
    private const MESSAGES = [
        ['Omar Haddad', 'omar.haddad@example.com', 'Baggage allowance to London', 'Could you confirm the checked baggage allowance in economy on the Dubai to London route?'],
        ['Layla Nasser', 'layla.nasser@example.com', 'Changing my travel date', 'I booked with PNR reference last week and need to move my departure forward by two days.'],
        ['Yousef Karim', 'yousef.karim@example.com', 'Seat selection for a family', 'We are travelling with two children and would like four seats together in the same row.'],
        ['Sara Mansour', 'sara.mansour@example.com', 'Special meal request', 'Is it possible to add a vegetarian meal to an existing business class booking?'],
        ['Kareem Fadel', 'kareem.fadel@example.com', 'Refund status', 'My Doha flight was cancelled and I would like to check where the refund has reached.'],
        ['Nour Sabbagh', 'nour.sabbagh@example.com', 'Group booking for twelve', 'We are organising a company trip to Istanbul and need a quote for twelve travellers.'],
        ['Hassan Darwish', 'hassan.darwish@example.com', 'Wheelchair assistance', 'My father needs airport assistance on arrival in Cairo. How do I arrange it?'],
        ['Maya Khalil', 'maya.khalil@example.com', 'Promo code not applying', 'The SUMMER25 code is not being accepted on my Maldives search results.'],
    ];

    private const SUBSCRIBERS = [
        ['news.reader1@example.com', 'en'], ['qari.akhbar@example.com', 'ar'],
        ['news.reader2@example.com', 'en'], ['mushtarik1@example.com', 'ar'],
        ['news.reader3@example.com', 'en'], ['mushtarik2@example.com', 'ar'],
        ['news.reader4@example.com', 'en'], ['mushtarik3@example.com', 'ar'],
        ['news.reader5@example.com', 'en'], ['mushtarik4@example.com', 'ar'],
        ['news.reader6@example.com', 'en'], ['mushtarik5@example.com', 'ar'],
    ];

    public function run(): void
    {
        foreach (self::MESSAGES as $index => [$name, $email, $subject, $message]) {
            ContactMessage::updateOrCreate(
                ['email' => $email, 'subject' => $subject],
                [
                    'name' => $name,
                    'message' => $message,
                    'status' => match (true) {
                        $index < 3 => 'new',
                        $index < 6 => 'read',
                        default => 'replied',
                    },
                    'created_at' => now()->subDays(random_int(0, 21)),
                ]
            );
        }

        foreach (self::SUBSCRIBERS as [$email, $locale]) {
            NewsletterSubscriber::updateOrCreate(
                ['email' => $email],
                ['locale' => $locale, 'is_active' => true]
            );
        }
    }
}
