<?php

return [
    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    /*
    | Only the front-end origins we control may call the API. A wildcard here
    | would let any site on the internet issue authenticated requests on a
    | visitor's behalf.
    */
    'allowed_origins' => array_filter([
        env('FRONTEND_URL', 'http://localhost:5173'),
        'http://localhost:5174',
        'http://127.0.0.1:5173',
    ]),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['Accept', 'Authorization', 'Content-Type', 'X-Requested-With'],

    'exposed_headers' => [],

    'max_age' => 3600,

    'supports_credentials' => false,
];
