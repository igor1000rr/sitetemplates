<?php

return [
    'paths' => ['api/*', 'sanctum/*', 'panel/*', 'livewire/*'],
    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    'allowed_origins' => [
        env('FRONTEND_URL', 'http://localhost:3000'),
    ],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    'exposed_headers' => ['X-RateLimit-Remaining', 'X-RateLimit-Limit'],
    'max_age' => 7200,
    'supports_credentials' => true,
];
