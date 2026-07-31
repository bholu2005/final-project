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
     * 🔥 THE CORE REGEX ENGINE
     */
    private function scanContent($content, $file, &$score)
    {
        $lines = explode("\n", $content);
        $foundIssues = [];

        // 1. SQL Injection (Raw Queries)
        if (preg_match('/SELECT\s+\*\s+FROM.*\$[a-zA-Z0-9_]+/i', $content)) {
            $lineNum = $this->findLineNumber($lines, 'SELECT * FROM');
            $foundIssues[] = [
                'id' => uniqid(),
                'name' => 'SQL Injection Vulnerability',
                'severity' => 'High',
                'type' => 'Security',
                'location' => $file,
                'line' => $lineNum,
                'snippet' => $lines[$lineNum-1] ?? '',
                'description' => 'Raw SQL queries are vulnerable to injection attacks. User input is directly concatenated.',
                'fix_suggestion' => "// Use Prepared Statements (PDO):\n\$stmt = \$pdo->prepare('SELECT * FROM users WHERE id = :id');\n\$stmt->execute(['id' => \$id]);"
            ];
            $score -= 15;
        }

        // 2. Hardcoded Secrets (API Keys)
        if (preg_match('/(api_key|secret|password|token)\s*=\s*[\'"][^\'"]+[\'"]/i', $content)) {
            $lineNum = $this->findLineNumber($lines, 'api_key'); 
            if($lineNum == -1) $lineNum = $this->findLineNumber($lines, 'password');
            if($lineNum == -1) $lineNum = $this->findLineNumber($lines, 'secret');
            
            $foundIssues[] = [
                'id' => uniqid(),
                'name' => 'Hardcoded Secret Detected',
                'severity' => 'Critical',
                'type' => 'Security',
                'location' => $file,
                'line' => $lineNum,
                'snippet' => $lines[$lineNum-1] ?? '',
                'description' => 'Sensitive keys should never be hardcoded in source code.',
                'fix_suggestion' => "// Move to .env file:\nAPI_KEY=your_secret_here\n\n// Access in code:\n\$key = getenv('API_KEY');"
            ];
            $score -= 20;
        }

        // 3. Dangerous Eval
        if (preg_match('/eval\s*\(/i', $content)) {
            $lineNum = $this->findLineNumber($lines, 'eval(');
            $foundIssues[] = [
                'id' => uniqid(),
                'name' => 'Dangerous Function (eval)',
                'severity' => 'Critical',
                'type' => 'Security',
                'location' => $file,
                'line' => $lineNum,
                'snippet' => $lines[$lineNum-1] ?? '',
                'description' => 'Eval executes arbitrary code and is a major security risk.',
                'fix_suggestion' => "Remove eval() completely. Use json_decode() or alternative logic."
            ];
            $score -= 20;
        }
        
        // 4. XSS (Echoing GET/POST)
        if (preg_match('/echo\s+\$_(GET|POST)/i', $content)) {
            $lineNum = $this->findLineNumber($lines, 'echo $_');
            $foundIssues[] = [
                'id' => uniqid(),
                'name' => 'XSS Vulnerability',
                'severity' => 'Medium',
                'type' => 'Security',
                'location' => $file,
                'line' => $lineNum,
                'snippet' => $lines[$lineNum-1] ?? '',
                'description' => 'Direct output of user input causes Cross-Site Scripting (XSS).',
                'fix_suggestion' => "echo htmlspecialchars(\$_GET['input'], ENT_QUOTES, 'UTF-8');"
            ];
            $score -= 10;
        }

        // 5. Debugging Leftovers (dd/var_dump/console.log)
        if (preg_match('/(dd\(|var_dump\(|console\.log\()/i', $content)) {
             $lineNum = $this->findLineNumber($lines, 'dd(');
             if($lineNum == -1) $lineNum = $this->findLineNumber($lines, 'console.log');

             $foundIssues[] = [
                'id' => uniqid(),
                'name' => 'Debug Code Leftover',
                'severity' => 'Low',
                'type' => 'Code Quality',
                'location' => $file,
                'line' => $lineNum,
                'snippet' => $lines[$lineNum-1] ?? '',
                'description' => 'Debug functions should be removed in production.',
                'fix_suggestion' => "// Remove the debug line."
            ];
            $score -= 5;
        }

        return $foundIssues;
    }

    private function findLineNumber($lines, $search) {
        foreach ($lines as $index => $line) { 
            if (stripos($line, $search) !== false) return $index + 1; 
        } 
        return 1;
    }
}