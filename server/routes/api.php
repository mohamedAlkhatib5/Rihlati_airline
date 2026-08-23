<?php

use App\Http\Controllers\Api\V1\Admin\BookingController as AdminBookingController;
use App\Http\Controllers\Api\V1\Admin\DashboardController;
use App\Http\Controllers\Api\V1\Admin\FlightController as AdminFlightController;
use App\Http\Controllers\Api\V1\Admin\ManifestController;
use App\Http\Controllers\Api\V1\Admin\ReferenceController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BookingController;
use App\Http\Controllers\Api\V1\DestinationController;
use App\Http\Controllers\Api\V1\FlightSearchController;
use App\Http\Controllers\Api\V1\OfferController;
use App\Http\Controllers\Api\V1\SupportController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rihlati API — version 1
|--------------------------------------------------------------------------
|
| Public routes need no token. `auth.jwt` verifies the bearer token and binds
| the user; `role:` gates a route to specific roles on top of that.
|
*/

Route::prefix('v1')->group(function () {
    Route::get('health', fn () => response()->json([
        'status' => 'ok',
        'service' => config('app.name'),
        'time' => now()->toIso8601String(),
    ]));

    /* ---------------------------------------------------------------- public */
    Route::get('destinations', [DestinationController::class, 'index']);
    Route::get('destinations/{destination}', [DestinationController::class, 'show']);

    Route::get('flights/search', FlightSearchController::class);
    Route::get('flights/{flight}/seat-map', [BookingController::class, 'seatMap']);

    Route::get('offers', [OfferController::class, 'index']);
    Route::post('offers/validate', [OfferController::class, 'validateCode']);

    Route::post('contact', [SupportController::class, 'contact'])->middleware('throttle:10,1');
    Route::post('newsletter', [SupportController::class, 'subscribe'])->middleware('throttle:10,1');

    /* ------------------------------------------------------------- bookings */
    Route::post('bookings', [BookingController::class, 'store'])->middleware('throttle:20,1');
    Route::get('bookings/{pnr}', [BookingController::class, 'show']);
    Route::post('bookings/{pnr}/cancel', [BookingController::class, 'cancel']);

    /* ----------------------------------------------------------------- auth */
    Route::prefix('auth')->group(function () {
        Route::post('register', [AuthController::class, 'register'])->middleware('throttle:10,1');
        Route::post('login', [AuthController::class, 'login'])->middleware('throttle:20,1');
        Route::post('refresh', [AuthController::class, 'refresh']);

        Route::middleware('auth.jwt')->group(function () {
            Route::get('me', [AuthController::class, 'me']);
            Route::post('logout', [AuthController::class, 'logout']);
        });
    });

    /* ---------------------------------------------------------------- admin */
    Route::prefix('admin')
        ->middleware(['auth.jwt', 'role:admin,staff'])
        ->group(function () {
            Route::get('stats', DashboardController::class);
            Route::get('options', [ReferenceController::class, 'options']);

            Route::get('flights', [AdminFlightController::class, 'index']);
            Route::get('flights/{flight}', [AdminFlightController::class, 'show']);
            Route::get('flights/{flight}/manifest', [ManifestController::class, 'show']);
            Route::get('flights/{flight}/manifest.csv', [ManifestController::class, 'export']);

            Route::get('bookings', [AdminBookingController::class, 'index']);
            Route::get('bookings/{booking}', [AdminBookingController::class, 'show']);

            Route::get('messages', [ReferenceController::class, 'messages']);
            Route::get('users', [ReferenceController::class, 'users']);
            Route::get('audit-logs', [ReferenceController::class, 'auditLogs']);

            /* Writes are limited to full administrators. */
            Route::middleware('role:admin')->group(function () {
                Route::post('flights', [AdminFlightController::class, 'store']);
                Route::put('flights/{flight}', [AdminFlightController::class, 'update']);
                Route::delete('flights/{flight}', [AdminFlightController::class, 'destroy']);

                Route::patch('bookings/{booking}/status', [AdminBookingController::class, 'updateStatus']);
                Route::patch('messages/{message}', [ReferenceController::class, 'updateMessage']);
            });
        });
});
