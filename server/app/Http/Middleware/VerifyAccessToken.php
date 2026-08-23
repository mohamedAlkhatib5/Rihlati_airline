<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Services\TokenService;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Authenticates a request from its `Authorization: Bearer <token>` header and
 * binds the resolved user onto the request.
 */
class VerifyAccessToken
{
    public function __construct(private readonly TokenService $tokens) {}

    public function handle(Request $request, Closure $next): Response
    {
        $claims = $this->tokens->verify($request->bearerToken());

        if (! $claims) {
            return $this->unauthorised('Your session has expired. Sign in again.');
        }

        $user = User::find($claims['sub'] ?? null);

        if (! $user || ! $user->is_active) {
            return $this->unauthorised('This account is no longer active.');
        }

        $request->setUserResolver(fn () => $user);

        return $next($request);
    }

    private function unauthorised(string $message): JsonResponse
    {
        return response()->json(['message' => $message], 401);
    }
}
