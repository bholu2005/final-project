<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiAssistantController extends Controller
{
    /**
     * Handle user chat queries using the Anthropic Claude API.
     */
    public function chat(Request $request)
    {
        $request->validate([
            'message' => 'required|string',
            'code' => 'nullable|string',
            'history' => 'nullable|array',
        ]);

        $message = $request->input('message');
        $code = $request->input('code');
        $history = $request->input('history', []);

        $apiKey = env('ANTHROPIC_API_KEY');

        if (empty($apiKey)) {
            // Return simulation fallback if no key is supplied
            return $this->simulationResponse($message, $code);
        }

        try {
            // Construct message format for Anthropic Claude (Messages API)
            $systemPrompt = "You are Merlin Sec AI, a professional cyber security copilot and code auditor. Give highly professional, concise, and helpful answers.";
            if ($code) {
                $systemPrompt .= "\nAnalyze this code context for security issues and fix recommendations:\n```\n" . $code . "\n```";
            }

            $messages = [];
            foreach ($history as $h) {
                if (isset($h['sender']) && isset($h['text'])) {
                    $role = $h['sender'] === 'user' ? 'user' : 'assistant';
                    $messages[] = [
                        'role' => $role,
                        'content' => $h['text']
                    ];
                }
            }

            $messages[] = [
                'role' => 'user',
                'content' => $message
            ];

            $response = Http::withHeaders([
                'x-api-key' => $apiKey,
                'anthropic-version' => '2023-06-01',
                'content-type' => 'application/json',
            ])->timeout(30)->post('https://api.anthropic.com/v1/messages', [
                'model' => 'claude-3-haiku-20240307',
                'max_tokens' => 1024,
                'system' => $systemPrompt,
                'messages' => $messages,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $reply = $data['content'][0]['text'] ?? 'Unable to parse AI response.';
                return response()->json([
                    'success' => true,
                    'reply' => $reply,
                    'provider' => 'anthropic'
                ]);
            }

            Log::error('Anthropic API error: ' . $response->body());
            return $this->simulationResponse($message, $code);

        } catch (\Exception $e) {
            Log::error('Anthropic Integration Exception: ' . $e->getMessage());
            return $this->simulationResponse($message, $code);
        }
    }

    /**
     * Simulates intelligent security audits if no active API Key is configured.
     */
    private function simulationResponse($message, $code)
    {
        $messageLower = strtolower($message);

        if (str_contains($messageLower, 'xss') || str_contains($messageLower, 'cross-site')) {
            $reply = "🔍 **Merlin Sec AI Code Audit (Simulated): XSS Vulnerability**\n\nCross-Site Scripting occurs when untrusted input is reflected directly without escaping. To fix this:\n1. Use built-in template engine escaping (e.g., `{{ $var }}` in Laravel instead of `{!! $var !!}`).\n2. Escape attributes and use sanitization helpers like Purifier.\n\n```php\n// SECURE REMEDIATION:\n$clean_input = clean(\$request->input('comment'));\n```";
        } elseif (str_contains($messageLower, 'sqli') || str_contains($messageLower, 'sql')) {
            $reply = "🛡️ **Merlin Sec AI Code Audit (Simulated): SQL Injection Detected**\n\nDynamic raw queries are extremely dangerous. Always use parameterized PDO prepared statements.\n\n```php\n// SECURE REMEDIATION:\n\$results = DB::table('users')->where('id', \$id)->get();\n```";
        } elseif (!empty($code)) {
            $reply = "💻 **Merlin Sec AI Code Review (Simulated)**\n\nI analyzed your snippet. It contains structural segments matching typical PHP patterns. I recommend auditing input sanitation, verifying Sanctum auth tokens on access points, and avoiding hardcoded credentials. Copy the remediation fix suggestions below:\n\n```php\n// RECOMMENDED REMEDIATION:\n\$securedData = htmlspecialchars(\$input, ENT_QUOTES, 'UTF-8');\n```";
        } else {
            $reply = "🧙 **Welcome to Merlin Sec AI!**\n\nI am your cybersecurity assistant. You can upload code or ask questions about vulnerabilities (XSS, CSRF, SQLi, SSRF, RCE, IDOR). Feel free to paste a script segment above and ask for safe remediations!";
        }

        return response()->json([
            'success' => true,
            'reply' => $reply,
            'provider' => 'simulation'
        ]);
    }
}
