<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupportController extends Controller
{
    public function contact(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:120'],
            'email' => ['required', 'email', 'max:191'],
            'subject' => ['required', 'string', 'min:3', 'max:160'],
            'message' => ['required', 'string', 'min:10', 'max:4000'],
        ]);

        ContactMessage::create([...$data, 'status' => 'new']);

        return response()->json([
            'message' => 'Thank you. Your message has been sent successfully.',
        ], 201);
    }

    public function subscribe(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'max:191'],
            'locale' => ['nullable', 'in:en,ar'],
        ]);

        // Re-subscribing is not an error; it just reactivates the address.
        NewsletterSubscriber::updateOrCreate(
            ['email' => strtolower($data['email'])],
            ['locale' => $data['locale'] ?? 'en', 'is_active' => true]
        );

        return response()->json([
            'message' => 'You are now subscribed to Rihlati updates.',
        ], 201);
    }
}
