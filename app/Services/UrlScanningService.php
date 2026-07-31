<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Symfony\Component\DomCrawler\Crawler;
use GuzzleHttp\TransferStats;

class UrlScanningService
{
    public function runScan($url)
    {
        $issues = [];
        $score = 100;
        $responseTime = 0;

        try {
            // 1. Real HTTP Request
            $response = Http::withOptions([
                'verify' => true, // SSL Strict Check
                'timeout' => 15,
                'on_stats' => function (TransferStats $stats) use (&$responseTime) {
                    $responseTime = $stats->getTransferTime() * 1000; // Convert to ms
                }
            ])->get($url);

            $headers = array_change_key_case($response->headers(), CASE_LOWER);
            $status = $response->status();
            $body = $response->body();

            // 🛡️ CHECK 1: SSL/HTTPS
            if (!str_starts_with($url, 'https://')) {
                $issues[] = $this->makeIssue(
                    'Insecure Protocol (HTTP)', 
                    'High', 
                    'Security', 
                    'URL Protocol', 
                    'The site is not using HTTPS encryption.',
                    "# Nginx Redirect:\nserver {\n    listen 80;\n    server_name example.com;\n    return 301 https://\$host\$request_uri;\n}"
                );
                $score -= 30;
            }

            // 🛡️ CHECK 2: Status Code
            if ($status >= 400) {
                $issues[] = $this->makeIssue("HTTP Error $status", 'Critical', 'Availability', 'Server', "The website returned an error code.", 'Check server logs.');
                $score -= 50;
            }

            // 🛡️ CHECK 3: Security Headers
            $requiredHeaders = [
                'x-frame-options' => 'add_header X-Frame-Options "SAMEORIGIN";',
                'x-xss-protection' => 'add_header X-XSS-Protection "1; mode=block";',
                'strict-transport-security' => 'add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;',
                'content-security-policy' => 'add_header Content-Security-Policy "default-src \'self\';";',
                'x-content-type-options' => 'add_header X-Content-Type-Options "nosniff";'
            ];

            foreach ($requiredHeaders as $key => $fix) {
                if (!isset($headers[$key])) {
                    $issues[] = $this->makeIssue(
                        "Missing Header: $key", 
                        'Medium', 
                        'Security', 
                        'Server Config', 
                        "The '$key' header is missing.",
                        "# Nginx Config:\n" . $fix
                    );
                    $score -= 5;
                }
            }

            // 🛡️ CHECK 4: Server Leak
            if (isset($headers['server'])) {
                $issues[] = $this->makeIssue(
                    'Server Version Disclosure', 
                    'Low', 
                    'Security', 
                    'Headers', 
                    "Server reveals technology: " . ($headers['server'][0] ?? 'Unknown'),
                    "# Nginx:\nserver_tokens off;"
                );
                $score -= 5;
            }

            // ⚡ CHECK 5: Performance
            if ($responseTime > 1000) {
                $issues[] = $this->makeIssue('Slow Response Time', 'Medium', 'Performance', 'Network', "Server took {$responseTime}ms.", "Optimize DB queries & enable caching.");
                $score -= 10;
            }

            // 🕸️ CHECK 6: HTML Analysis (Forms)
            $crawler = new Crawler($body);
            
            // Check Forms for CSRF
            $crawler->filter('form')->each(function (Crawler $node) use (&$issues, &$score) {
                $inputs = $node->filter('input[name="_token"], input[name="csrf_token"]');
                if ($inputs->count() === 0) {
                    $issues[] = $this->makeIssue(
                        'Form Missing CSRF Token', 
                        'High', 
                        'Security', 
                        'HTML Form', 
                        "Form action '" . ($node->attr('action') ?? 'unknown') . "' lacks CSRF protection.",
                        "// Laravel:\n@csrf\n\n// Plain PHP:\n<input type='hidden' name='csrf_token' value='...' />"
                    );
                    $score -= 15;
                }
            });

        } catch (\Exception $e) {
            return [
                'score' => 0,
                'issues' => [$this->makeIssue('Site Unreachable', 'Critical', 'Network', 'DNS', $e->getMessage(), 'Check URL validity.')],
            ];
        }

        return [
            'score' => max(0, $score),
            'issues' => $issues
        ];
    }

    private function makeIssue($name, $severity, $type, $location, $desc, $fix) {
        return [
            'id' => uniqid(),
            'name' => $name,
            'severity' => $severity,
            'type' => $type,
            'location' => $location,
            'description' => $desc,
            'fix_suggestion' => $fix
        ];
    }
}