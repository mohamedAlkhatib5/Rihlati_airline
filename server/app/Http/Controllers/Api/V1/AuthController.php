<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\TokenService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function __construct(private readonly TokenService $tokens) {}

    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:120'],
            'email' => ['required', 'email', 'max:191', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::min(8)->letters()->numbers()],
            'phone' => ['nullable', 'string', 'max:32'],
        ]);

        // Role is never taken from the request; self-registration is always a
        // customer account.
        $user = User::create([
            ...$data,
            'role' => User::ROLE_CUSTOMER,
            'is_active' => true,
        ]);

        return response()->json([
            'user' => new UserResource($user),
            ...$this->tokens->issueFor($user),
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        // Throttle by email + IP so an attacker cannot grind through passwords.
        $key = 'login:'.strtolower($credentials['email']).'|'.$request->ip();

        if (RateLimiter::tooManyAttempts($key, 5)) {
            return response()->json([
                'message' => 'Too many attempts. Try again in '
                    .RateLimiter::availableIn($key).' seconds.',
            ], 429);
        }

        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            RateLimiter::hit($key, 300);

            // One message for both cases, so the response cannot be used to
            // discover which email addresses have accounts.
            return response()->json(['message' => 'Email or password is incorrect.'], 422);
        }

        if (! $user->is_active) {
            return response()->json(['message' => 'This account has been disabled.'], 403);
        }

        RateLimiter::clear($key);

        return response()->json([
            'user' => new UserResource($user),
            ...$this->tokens->issueFor($user),
        ]);
    }

    public function refresh(Request $request): JsonResponse
    {
        $claims = $this->tokens->verify($request->input('refresh_token'), 'refresh');
        $user = $claims ? User::find($claims['sub']) : null;

        if (! $user || ! $user->is_active) {
            return response()->json(['message' => 'Your session has expired. Sign in again.'], 401);
        }

        return response()->json([
            'user' => new UserResource($user),
            ...$this->tokens->issueFor($user),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['user' => new UserResource($request->user())]);
    }

    /**
     * Tokens are stateless, so signing out is a client-side discard. The
     * endpoint exists so the front-end has one obvious call to make, and so a
     * future token denylist has somewhere to live.
     */
    public function logout(): JsonResponse
    {
        return response()->json(['message' => 'Signed out.']);
    }
}
