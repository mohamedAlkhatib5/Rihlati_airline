<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\OfferResource;
use App\Models\Offer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class OfferController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $offers = Offer::query()
            ->redeemable()
            ->with('destination.airport')
            ->orderByDesc('discount_value')
            ->get();

        return OfferResource::collection($offers);
    }

    /** Checks a promo code and returns what it would take off a subtotal. */
    public function validateCode(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:24'],
            'subtotal' => ['required', 'integer', 'min:1'],
        ]);

        $offer = Offer::redeemable()
            ->whereRaw('UPPER(code) = ?', [strtoupper($data['code'])])
            ->first();

        if (! $offer) {
            return response()->json([
                'valid' => false,
                'message' => 'That code is not valid or has expired.',
            ], 422);
        }

        $discount = $offer->discountFor($data['subtotal']);

        return response()->json([
            'valid' => true,
            'code' => $offer->code,
            'discount' => $discount,
            'total' => $data['subtotal'] - $discount,
            'offer' => new OfferResource($offer),
        ]);
    }
}
