<?php

return [
    'ssr' => [
        'enabled' => (bool) env('INERTIA_SSR_ENABLED', true),
        'url' => env('INERTIA_SSR_URL', 'http://127.0.0.1:13714'),
        'timeout' => 3,
        'ensure_bundle_exists' => true,
        'throw_on_error' => (bool) env('INERTIA_SSR_THROW_ON_ERROR', true),
    ],
    'pages' => ['ensure_pages_exist' => true, 'paths' => [resource_path('js/Pages')], 'extensions' => ['jsx']],
    'testing' => ['ensure_pages_exist' => true],
];
