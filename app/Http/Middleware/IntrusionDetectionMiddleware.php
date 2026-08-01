<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\SecurityLog;
use Illuminate\Support\Facades\Log;

class IntrusionDetectionMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $payloads = $request->all();
        $userAgent = $request->header('User-Agent') ?? '';
        $ip = $request->ip() ?? '127.0.0.1';
        $url = $request->fullUrl();
        $userId = $request->user()?->id;

        // 🤖 1. BOT & AUTOMATED SCRAPER SCANNER
        if (preg_match('/(gptbot|claudebot|googlebot|python-requests|headless|axios|curl)/i', $userAgent)) {
            // Let's log it but only block if they attempt malicious actions or we want a shield
            // For now, let's log the AI Scraper access
            Log::info("AI Scraper / Bot Access detected from IP: " . $ip . " | Agent: " . $userAgent);
        }

        // 🛡️ 2. ATTACK VECTOR PATTERNS (SQLi, Path Traversal, Command Injection)
        $attackType = null;
        $matchedPayload = null;
        $threatLevel = 'medium';

        // Check each input value recursively
        $this->scanPayloadRecursive($payloads, $attackType, $matchedPayload, $threatLevel);

        if ($attackType) {
            // Log to database
            SecurityLog::create([
                'user_id' => $userId,
                'ip_address' => $ip,
                'target_url' => $url,
                'attack_type' => $attackType,
                'payload' => json_encode($matchedPayload),
                'threat_level' => $threatLevel,
                'location' => 'Payload Input'
            ]);

            // Return custom self-defense blocks
            return response()->json([
                'success' => false,
                'message' => 'Security Platform Self-Defense Shield: Malicious request blocked. Activity has been logged and reported to Security Operations.',
                'blocked' => true,
                'vector' => $attackType,
                'threat_level' => $threatLevel
            ], 403);
        }

        return $next($request);
    }

    private function scanPayloadRecursive($data, &$attackType, &$matchedPayload, &$threatLevel)
    {
        if (is_array($data)) {
            foreach ($data as $key => $value) {
                $this->scanPayloadRecursive($value, $attackType, $matchedPayload, $threatLevel);
                if ($attackType) return;
            }
        } elseif (is_string($data)) {
            // Check SQLi
            if (preg_match('/(union\s+select|select\s+.*\s+from|insert\s+into|delete\s+from|drop\s+table|["\']\s*or\s*["\']?1\s*=\s*1)/i', $data)) {
                $attackType = 'SQL Injection Attack (SQLi)';
                $matchedPayload = $data;
                $threatLevel = 'critical';
            }
            // Check Path Traversal
            elseif (preg_match('/(\.\.\/|\.\.\\\\|\/etc\/passwd|win\.ini|boot\.ini)/i', $data)) {
                $attackType = 'Path Traversal / Local File Inclusion';
                $matchedPayload = $data;
                $threatLevel = 'high';
            }
            // Check Command Injection / Executables
            elseif (preg_match('/(shell_exec|system\(|exec\(|cmd\.exe|\/bin\/bash|rm\s+-rf)/i', $data)) {
                $attackType = 'Remote Code Execution / Command Injection';
                $matchedPayload = $data;
                $threatLevel = 'critical';
            }
        }
    }
}
