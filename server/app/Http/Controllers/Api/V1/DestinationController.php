<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\DestinationResource;
use App\Models\Destination;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class DestinationController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $destinations = Destination::query()
            ->active()
            ->with('airport')
            ->when($request->boolean('featured'), fn ($query) => $query->featured())
            ->when($request->filled('region'), fn ($query) => $query->where('region', $request->string('region')))
            ->orderBy('sort_order')
            ->get();

        return DestinationResource::collection($destinations);
    }

    public function show(Destination $destination): DestinationResource
    {
        abort_unless($destination->is_active, 404);

        return new DestinationResource($destination->load('airport'));
    }
}
