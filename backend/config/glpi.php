<?php

return [
    'url'         => env('GLPI_URL'),
    'app_token'   => env('GLPI_APP_TOKEN'),
    'user_token'  => env('GLPI_USER_TOKEN'),
    'ssl_verify'  => env('GLPI_SSL_VERIFY', true),
    'timeout'     => (int) env('GLPI_TIMEOUT', 30),
];
