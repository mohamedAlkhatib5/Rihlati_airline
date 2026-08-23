<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Aircraft;
use App\Models\Airport;
use App\Models\AuditLog;
use App\Models\ContactMessage;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Supporting data the dashboard needs: dropdown options, the contact inbox,
 * user administration and the audit trail.
 */
class ReferenceController extends Controller
{
    /** Options for the flight form's select fields. */
    public function options(): JsonResponse
    {
        return response()->json([
            'data' => [
                'airports' => Airport::orderBy('city_en')
                    ->get(['id', 'iata', 'city_en as city', 'country_en as country']),
                'aircraft' => Aircraft::where('is_active', true)
                    ->orderBy('model')
                    ->get(['id', 'model', 'registration', 'rows_economy', 'rows_business', 'seats_per_row']),
                'cabins' => ['economy', 'premium', 'business', 'first'],
                'statuses' => ['scheduled', 'delayed', 'departed', 'arrived', 'cancelled'],
            ],
        ]);
    }

    public function messages(Request $request): JsonResponse
    {
        $messages = ContactMessage::query()
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->latest()
            ->paginate(min($request->integer('perPage', 20), 100));

        return response()->json($messages);
    }

    public function updateMessage(Request $request, ContactMessage $message): JsonResponse
    {
        $data = $request->validate(['status' => ['required', 'in:new,read,replied']]);
        $message->update($data);

        return response()->json(['message' => 'Updated.', 'data' => $message]);
    }

    public function users(Request $request): JsonResponse
    {
        $users = User::query()
            ->when($request->filled('role'), fn ($q) => $q->where('role', $request->string('role')))
            ->when($request->filled('q'), fn ($q) => $q
                ->where('name', 'like', '%'.$request->string('q').'%')
                ->orWhere('email', 'like', '%'.$request->string('q').'%'))
            ->withCount('bookings')
            ->latest()
            ->paginate(min($request->integer('perPage', 20), 100));

        return response()->json($users);
    }

    public function auditLogs(Request $request): JsonResponse
    {
        $logs = AuditLog::with('user:id,name,email')
            ->latest()
            ->paginate(min($request->integer('perPage', 30), 100));

        return response()->json($logs);
    }
}
