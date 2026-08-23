<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\ContactMessage;
use App\Models\Flight;
use App\Models\Passenger;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /** Headline figures and charts for the dashboard landing page. */
    public function __invoke(): JsonResponse
    {
        $paidStatuses = ['confirmed', 'completed'];
        $startOfMonth = now()->startOfMonth();

        return response()->json([
            'data' => [
                'kpis' => [
                    'bookingsToday' => Booking::whereDate('created_at', today())->count(),
                    'bookingsThisMonth' => Booking::where('created_at', '>=', $startOfMonth)->count(),
                    'revenueThisMonth' => (int) Booking::whereIn('status', $paidStatuses)
                        ->where('created_at', '>=', $startOfMonth)
                        ->sum('total_amount'),
                    'revenueTotal' => (int) Booking::whereIn('status', $paidStatuses)->sum('total_amount'),
                    'averageBookingValue' => (int) round(
                        Booking::whereIn('status', $paidStatuses)->avg('total_amount') ?? 0
                    ),
                    'passengers' => Passenger::count(),
                    'upcomingFlights' => Flight::bookable()->where('departure_at', '>', now())->count(),
                    'unreadMessages' => ContactMessage::where('status', 'new')->count(),
                ],

                'bookingsByStatus' => Booking::query()
                    ->select('status', DB::raw('COUNT(*) as total'))
                    ->groupBy('status')
                    ->pluck('total', 'status'),

                'revenueByMonth' => Booking::query()
                    ->whereIn('status', $paidStatuses)
                    ->where('created_at', '>=', now()->subMonths(11)->startOfMonth())
                    ->select(
                        DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month"),
                        DB::raw('SUM(total_amount) as revenue'),
                        DB::raw('COUNT(*) as bookings'),
                    )
                    ->groupBy('month')
                    ->orderBy('month')
                    ->get(),

                'topRoutes' => DB::table('booking_segments')
                    ->join('flights', 'flights.id', '=', 'booking_segments.flight_id')
                    ->join('airports as origin', 'origin.id', '=', 'flights.origin_airport_id')
                    ->join('airports as destination', 'destination.id', '=', 'flights.destination_airport_id')
                    ->select(
                        DB::raw("CONCAT(origin.iata, '-', destination.iata) as route"),
                        'origin.city_en as originCity',
                        'destination.city_en as destinationCity',
                        DB::raw('COUNT(*) as bookings'),
                    )
                    ->groupBy('route', 'originCity', 'destinationCity')
                    ->orderByDesc('bookings')
                    ->limit(8)
                    ->get(),

                'cabinMix' => DB::table('booking_segments')
                    ->join('fare_classes', 'fare_classes.id', '=', 'booking_segments.fare_class_id')
                    ->select('fare_classes.cabin', DB::raw('COUNT(*) as total'))
                    ->groupBy('fare_classes.cabin')
                    ->pluck('total', 'cabin'),

                'recentBookings' => Booking::query()
                    ->latest()
                    ->limit(8)
                    ->get(['pnr', 'contact_email', 'status', 'total_amount', 'created_at']),
            ],
        ]);
    }
}
