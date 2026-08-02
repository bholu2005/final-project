<?php

namespace App\Services;

use ZipArchive;
use Illuminate\Support\Facades\File;

class ScanningService
{
    /**
     * Main Entry Point
     */
    public function runScan($filePath, $scope = 'fullstack', $dbPath = null, $categories = [])
    {
        $issues = [];
        $fileTree = []; 
        $flatFileList = []; // Animation ke liye Code Content
        $detectedTables = [];
        $score = 100;
        
        // 1. Path Setup
        $zipPath = storage_path('app/public/' . $filePath);
        $extractPath = storage_path('app/public/extracted/' . uniqid());

        // 2. Extract ZIP
        $zip = new ZipArchive;
        if ($zip->open($zipPath) === TRUE) {
            $zip->extractTo($extractPath);
            $zip->close();
        } else {
            // Error Fallback
            return [
                'score' => 0, 
                'issues' => [[
                    'id' => uniqid(),
                    'name' => 'Corrupt ZIP',
                    'severity' => 'Critical',
                    'type' => 'System',
                    'location' => 'Upload',
                    'description' => 'The uploaded file is not a valid ZIP archive.',
                    'fix_suggestion' => 'Please upload a valid .zip file.'
                ]], 
                'file_tree' => [], 
                'flat_list' => [], 
                'tables' => []
            ];
        }

        // 3. Recursive Scan & Tree Building
        $fileTree = $this->buildTreeAndScan($extractPath, $extractPath, $issues, $score, $flatFileList, $detectedTables);

        // 3b. Optional LLM-Augmented Analysis Pass
        $this->enhanceIssuesWithAi($issues);

        // 4. Fallback for Animation (Agar zip empty nikli)
        if (empty($flatFileList)) {
            $flatFileList[] = [
                'path' => 'scan.log',
                'content' => "// System initialized.\n// No readable source code found in ZIP.\n// Scan Complete.",
                'issues' => []
            ];
        }

        // 5. Cleanup
        File::deleteDirectory($extractPath);

        return [
            'score' => max(0, $score),
            'issues' => $issues,
            'file_tree' => $fileTree,
            // Array slice to prevent browser crash if files are too many (Max 40 files sent for animation)
            'flat_list' => array_slice($flatFileList, 0, 40), 
            'tables' => array_unique($detectedTables)
        ];
    }

    /**
     * Recursive Function to Build Tree & Scan Files
     */
    private function buildTreeAndScan($dir, $rootDir, &$issues, &$score, &$flatFileList, &$detectedTables)
    {
        $tree = [];
        $items = scandir($dir);

        foreach ($items as $item) {
            if ($item == '.' || $item == '..') continue;

            $path = $dir . DIRECTORY_SEPARATOR . $item;
            $relativePath = str_replace([$rootDir . '/', $rootDir . '\\'], '', $path);
            
            if (is_dir($path)) {
                // Folder Logic
                $children = $this->buildTreeAndScan($path, $rootDir, $issues, $score, $flatFileList, $detectedTables);
                if (!empty($children)) {
                    $tree[] = ['name' => $item, 'type' => 'folder', 'path' => $relativePath, 'children' => $children];
                }
            } else {
                // File Logic
                $ext = pathinfo($path, PATHINFO_EXTENSION);
                
                // Allow specific extensions
                if (in_array($ext, ['php', 'js', 'jsx', 'ts', 'tsx', 'html', 'css', 'sql', 'env', 'json', 'py', 'java', 'txt'])) {
                    
                    $rawContent = @file_get_contents($path);
                    
                    // 🔥 FIX: Skip Binary & Clean UTF-8
                    if (!$rawContent || $this->isBinary($rawContent)) continue;
                    $content = $this->cleanUtf8($rawContent);

                    // Extract SQL Tables
                    if ($ext === 'sql') {
                        preg_match_all('/CREATE\s+TABLE\s+[`"]?([a-zA-Z0-9_]+)[`"]?/i', $content, $matches);
                        if (!empty($matches[1])) foreach ($matches[1] as $table) $detectedTables[] = $table;
                    }

                    // 🔥 RUN REGEX SCANNER
                    $fileIssues = $this->scanContent($content, $relativePath, $score);
                    
                    foreach($fileIssues as $issue) $issues[] = $issue;

                    // Add to Tree Structure
                    $tree[] = ['name' => $item, 'path' => $relativePath, 'type' => 'file'];

                    // Add to Flat List (For Animation)
                    $flatFileList[] = [
                        'path' => $relativePath,
                        'content' => $content,
                        'issues' => $fileIssues
                    ];
                } 
                // Special Check for Large Images
                elseif (in_array($ext, ['jpg', 'png', 'jpeg', 'gif'])) {
                    if (filesize($path) > 2 * 1024 * 1024) { // 2MB
                        $issues[] = [
                            'id' => uniqid(),
                            'name' => 'Large Asset (>2MB)',
                            'severity' => 'Medium',
                            'type' => 'Performance',
                            'location' => $relativePath,
                            'line' => 0,
                            'snippet' => '',
                            'description' => 'Large images slow down page load speed.',
                            'fix_suggestion' => "Compress this image using WebP format."
                        ];
                        $score -= 5;
                    }
                }
            }
        }
        return $tree;
    }

    /**
     * Utility: Check if file is binary (like images inside zip)
     */
    private function isBinary($str) { 
        return preg_match('~[^\x20-\x7E\t\r\n]~', $str) > 0 && strlen($str) > 0 && substr_count($str, "\x00") > 0; 
    }

    /**
     * Utility: Ensure String is valid UTF-8 (Prevents JSON Errors)
     */
    private function cleanUtf8($string) {
        $string = str_replace("\0", "", $string);
        return mb_convert_encoding($string, 'UTF-8', 'UTF-8');
    }

    /**
     * 🔥 THE CORE REGEX ENGINE (INTELLIGENT SAST SIGNATURES)
     */
    private function scanContent($content, $file, &$score)
    {
        $lines = explode("\n", $content);
        $foundIssues = [];

        // 1. SQL Injection (Unescaped Variable Concatenation in Query Strings)
        foreach ($lines as $index => $line) {
            if (preg_match('/(SELECT|INSERT|UPDATE|DELETE)\s+.*\s+FROM\s+.*[\.\+]\s*\$[a-zA-Z0-9_]+/i', $line) ||
                preg_match('/(SELECT|INSERT|UPDATE|DELETE)\s+.*\s+FROM\s+.*WHERE\s+.*=\s*[\'"]?\$[a-zA-Z0-9_]+/i', $line)) {
                $foundIssues[] = [
                    'id' => uniqid(),
                    'name' => 'SQL Injection Vulnerability',
                    'severity' => 'High',
                    'type' => 'Security',
                    'location' => $file,
                    'line' => $index + 1,
                    'snippet' => trim($line),
                    'description' => 'Raw SQL queries utilizing variable interpolation or unescaped string concatenation are vulnerable to SQL Injection.',
                    'fix_suggestion' => "// Use Prepared Statements with Parameter Binding:\n\$stmt = \$pdo->prepare('SELECT * FROM users WHERE id = :id');\n\$stmt->execute(['id' => \$id]);"
                ];
                $score -= 15;
            }
        }

        // 2. Hardcoded Secrets (Tolerate placeholders/empty values to avoid false positives)
        foreach ($lines as $index => $line) {
            // Match assignments where the secret is non-empty, and has reasonable entropy/length (e.g., > 12 characters, not simple words)
            if (preg_match('/(api_key|secret_key|private_key|token|auth_token|db_password|aws_secret|api_password)\s*=\s*[\'"]([a-zA-Z0-9_\-\.\:\/=\+]{12,})[\'"]/i', $line, $matches)) {
                $secretValue = $matches[2] ?? '';
                // Ignore obvious placeholders
                $placeholders = ['your_secret', 'placeholder', 'dummy_value', 'your_api_key', 'your_password', 'my_secret_token', 'temp_key_here'];
                $isPlaceholder = false;
                foreach ($placeholders as $p) {
                    if (stripos($secretValue, $p) !== false) {
                        $isPlaceholder = true;
                        break;
                    }
                }
                if (!$isPlaceholder) {
                    $foundIssues[] = [
                        'id' => uniqid(),
                        'name' => 'Hardcoded Secret Detected',
                        'severity' => 'Critical',
                        'type' => 'Security',
                        'location' => $file,
                        'line' => $index + 1,
                        'snippet' => trim($line),
                        'description' => 'Sensitive credentials or cryptographic keys should never be hardcoded directly into the source code.',
                        'fix_suggestion' => "// Extract credentials into a secure environment file (.env):\nAPI_KEY=your_secure_credential_value\n\n// Access dynamically:\n\$apiKey = getenv('API_KEY');"
                    ];
                    $score -= 20;
                }
            }
        }

        // 3. Dangerous Eval Function Usage
        foreach ($lines as $index => $line) {
            if (preg_match('/eval\s*\([^\)]+\)/i', $line)) {
                $foundIssues[] = [
                    'id' => uniqid(),
                    'name' => 'Dangerous Function Usage (eval)',
                    'severity' => 'Critical',
                    'type' => 'Security',
                    'location' => $file,
                    'line' => $index + 1,
                    'snippet' => trim($line),
                    'description' => 'The eval() function executes arbitrary text strings as code and is an extremely high security vulnerability if user-controllable input reaches it.',
                    'fix_suggestion' => "// Replace eval() usage with safe alternatives (e.g., structured object parser or json_decode):\n\$data = json_decode(\$jsonString, true);"
                ];
                $score -= 20;
            }
        }
        
        // 4. Cross-Site Scripting (XSS) via Direct Echoing of User Input
        foreach ($lines as $index => $line) {
            if (preg_match('/echo\s+\$_(GET|POST|REQUEST)/i', $line)) {
                $foundIssues[] = [
                    'id' => uniqid(),
                    'name' => 'XSS Vulnerability',
                    'severity' => 'Medium',
                    'type' => 'Security',
                    'location' => $file,
                    'line' => $index + 1,
                    'snippet' => trim($line),
                    'description' => 'Directly outputting inputs like $_GET, $_POST, or $_REQUEST without sanitization or HTML encoding opens up Cross-Site Scripting (XSS) vectors.',
                    'fix_suggestion' => "echo htmlspecialchars(\$_GET['input'], ENT_QUOTES, 'UTF-8');"
                ];
                $score -= 10;
            }
        }

        // 5. Leftover Debug Code in Production
        foreach ($lines as $index => $line) {
            if (preg_match('/\b(dd\(|var_dump\(|print_r\(|console\.log\()/i', $line)) {
                $foundIssues[] = [
                    'id' => uniqid(),
                    'name' => 'Debug Code Leftover',
                    'severity' => 'Low',
                    'type' => 'Code Quality',
                    'location' => $file,
                    'line' => $index + 1,
                    'snippet' => trim($line),
                    'description' => 'Debug functions or output statements can leak application state or sensitive information to end-users.',
                    'fix_suggestion' => "// Ensure all developer-centric debugging code is stripped before release."
                ];
                $score -= 5;
            }
        }

        return $foundIssues;
    }

    /**
     * Optional LLM-Augmentation pass using Anthropic API key to refine discovered issues.
     */
    private function enhanceIssuesWithAi(&$issues)
    {
        $apiKey = env('ANTHROPIC_API_KEY');
        if (empty($apiKey) || empty($issues)) {
            return;
        }

        // Limit AI enhancement to the top 3 highest-priority issues to keep execution speedy
        $criticalOrHighIssues = array_filter($issues, function($issue) {
            return in_array($issue['severity'] ?? '', ['Critical', 'High']);
        });

        if (empty($criticalOrHighIssues)) {
            return;
        }

        $targets = array_slice($criticalOrHighIssues, 0, 3);

        foreach ($issues as $key => $issue) {
            // Find if this issue was selected for AI enhancement
            $isSelected = false;
            foreach ($targets as $target) {
                if ($target['id'] === $issue['id']) {
                    $isSelected = true;
                    break;
                }
            }

            if (!$isSelected) {
                continue;
            }

            try {
                $prompt = "You are Merlin Sec AI, an expert static application security testing analyzer. Refine this issue report to make it highly precise, OWASP-aligned, and secure.\n\n"
                    . "Vulnerability Name: " . $issue['name'] . "\n"
                    . "File Location: " . $issue['location'] . "\n"
                    . "Line Context: " . $issue['snippet'] . "\n"
                    . "Base Description: " . $issue['description'] . "\n\n"
                    . "Provide your response as a JSON object with two keys:\n"
                    . "1. 'description': A professional, concise analysis of the threat.\n"
                    . "2. 'fix_suggestion': A production-ready code snippet remediating the issue.\n"
                    . "Do not output any introductory or concluding text. Output ONLY valid JSON.";

                $response = \Illuminate\Support\Facades\Http::withHeaders([
                    'x-api-key' => $apiKey,
                    'anthropic-version' => '2023-06-01',
                    'content-type' => 'application/json',
                ])->timeout(8)->post('https://api.anthropic.com/v1/messages', [
                    'model' => 'claude-3-haiku-20240307',
                    'max_tokens' => 500,
                    'messages' => [
                        ['role' => 'user', 'content' => $prompt]
                    ],
                ]);

                if ($response->successful()) {
                    $resData = $response->json();
                    $reply = $resData['content'][0]['text'] ?? '';

                    // Parse JSON output from Claude
                    $cleanedJson = trim($reply);
                    if (preg_match('/\{[\s\S]*\}/', $cleanedJson, $jsonMatch)) {
                        $parsed = json_decode($jsonMatch[0], true);
                        if ($parsed) {
                            if (!empty($parsed['description'])) {
                                $issues[$key]['description'] = $parsed['description'] . " (Augmented by Merlin AI)";
                            }
                            if (!empty($parsed['fix_suggestion'])) {
                                $issues[$key]['fix_suggestion'] = $parsed['fix_suggestion'];
                            }
                        }
                    }
                }
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::warning("AI Issue enhancement failed: " . $e->getMessage());
            }
        }
    }
}