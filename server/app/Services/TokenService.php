<?php

namespace App\Services;

use App\Models\User;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Support\Str;
use Throwable;

/**
 * Issues and verifies the JSON Web Tokens used to authenticate the API.
 *
 * Access tokens are short-lived and carry the claims the API needs (id, role)
 * so most requests need no database lookup. Refresh tokens live longer, carry
 * nothing but an identity, and are the only thing that can mint a new access
 * token.
 */
class TokenService
{
    public function __construct(
        private readonly string $secret,
        private readonly string $algorithm,
        private readonly string $issuer,
        private readonly int $ttlMinutes,
        private readonly int $refreshTtlDays,
    ) {}

    public static function fromConfig(): self
    {
        return new self(
            (string) config('jwt.secret'),
            (string) config('jwt.algorithm'),
            (string) config('jwt.issuer'),
            (int) config('jwt.ttl_minutes'),
            (int) config('jwt.refresh_ttl_days'),
        );
    }

    /** @return array{access_token: string, refresh_token: string, expires_in: int, token_type: string} */
    public function issueFor(User $user): array
    {
        $now = time();
        $expiresIn = $this->ttlMinutes * 60;

        $access = $this->encode([
            'iss' => $this->issuer,
            'sub' => $user->id,
            'jti' => (string) Str::uuid(),
            'iat' => $now,
            'exp' => $now + $expiresIn,
            'typ' => 'access',
            'role' => $user->role,
            'name' => $user->name,
        ]);

        $refresh = $this->encode([
            'iss' => $this->issuer,
            'sub' => $user->id,
            'jti' => (string) Str::uuid(),
            'iat' => $now,
            'exp' => $now + $this->refreshTtlDays * 86400,
            'typ' => 'refresh',
        ]);

        return [
            'token_type' => 'Bearer',
            'access_token' => $access,
            'refresh_token' => $refresh,
            'expires_in' => $expiresIn,
        ];
    }

    /**
     * Decodes a token and returns its claims, or null when it is missing,
     * malformed, expired or of the wrong type.
     */
    public function verify(?string $token, string $expectedType = 'access'): ?array
    {
        if (! $token) {
            return null;
        }

        try {
            $claims = (array) JWT::decode($token, new Key($this->secret, $this->algorithm));
        } catch (Throwable) {
            return null;
        }

        return ($claims['typ'] ?? null) === $expectedType ? $claims : null;
    }

    private function encode(array $claims): string
    {
        return JWT::encode($claims, $this->secret, $this->algorithm);
    }
}
