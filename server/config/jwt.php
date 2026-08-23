<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Access token signing
    |--------------------------------------------------------------------------
    |
    | Tokens are signed with HS256 using a shared secret. The secret must never
    | be committed — `.env` holds it, and `.env.example` documents it.
    |
    */
    'secret' => env('JWT_SECRET'),

    'algorithm' => 'HS256',

    'issuer' => env('APP_URL', 'http://localhost'),

    /** Access token lifetime, in minutes. Short by design. */
    'ttl_minutes' => (int) env('JWT_TTL_MINUTES', 60),

    /** Refresh token lifetime, in days. */
    'refresh_ttl_days' => (int) env('JWT_REFRESH_TTL_DAYS', 14),
];
