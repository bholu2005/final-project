<?php

return [
    'postmark' => ['key' => env('POSTMARK_API_KEY')],
    'resend' => ['key' => env('RESEND_API_KEY')],
    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],
    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],
    'merlin_ai' => [
        'provider' => env('MERLIN_AI_PROVIDER', 'anthropic'),
        'api_key' => env('MERLIN_AI_API_KEY'),
        'model' => env('MERLIN_AI_MODEL', 'claude-3-5-sonnet-latest'),
        'base_url' => env('MERLIN_AI_BASE_URL'),
        'max_tokens' => env('MERLIN_AI_MAX_TOKENS', 1800),
    ],
    'github' => [
        'client_id' => env('GITHUB_CLIENT_ID'),
        'client_secret' => env('GITHUB_CLIENT_SECRET'),
        'redirect' => env('GITHUB_REDIRECT_URI', env('APP_URL').'/api/auth/github/callback'),
    ],
    'admin_emails' => env('ADMIN_EMAILS', ''),
];
