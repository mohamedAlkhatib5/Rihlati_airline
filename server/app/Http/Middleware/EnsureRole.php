<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Restricts a route to one or more roles.
 *
 *   Route::get(...)->middleware(['auth.jwt', 'role:admin,staff']);
 */
class EnsureRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user || ! in_array($user->role, $roles, true)) {
            return response()->json(
                ['message' => 'You do not have permission to perform this action.'],
                403
            );
        }

        return $next($request);
    }
}
