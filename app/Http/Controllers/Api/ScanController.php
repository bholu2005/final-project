<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Scan;
use Illuminate\Support\Str;
use App\Services\ScanningService;
use App\Services\UrlScanningService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class ScanController extends Controller
{
    // 🚀 INITIATE SCAN & SAVE HISTORY
    public function initiate(Request $request)
    {
        // 1. User Limit Check
        $user = $request->user();
        if ($user && $user->plan_type === 'free') {
            $today = Carbon::today()->toDateString();
            if ($user->last_scan_date !== $today) {
                $user->daily_scans_count = 0;
                $user->last_scan_date = $today;
                $user->save();
            }
            if ($user->daily_scans_count >= 3) {
                return response()->json(['success' => false, 'message' => 'Daily Limit Reached (3/3). Upgrade to continue.'], 403);
            }
        }

        try {
            // 2. Validation
            $request->validate([
                'inputType' => 'required|in:zip,url',
                'file' => 'nullable|file|max:102400', // 100MB Max
                'url' => 'nullable|url',
                'manualChecks' => 'nullable', // JSON string from frontend
                'scanScope' => 'nullable|string',
            ]);

            $reference = 'SCAN_' . Str::upper(Str::random(10));
            $targetValue = '';

            // 3. Handle File Upload
            if ($request->inputType === 'zip') {
                if (!$request->hasFile('file')) {
                    return response()->json(['success' => false, 'message' => 'ZIP file is missing.'], 400);
                }
                
                $file = $request->file('file');
                $filename = $reference . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('uploads', $filename, 'public');
                $targetValue = $path;
            } else {
                $targetValue = $request->url;
            }

            // Handle DB File
            $dbPath = null;
            if ($request->hasFile('dbFile')) {
                $dbFile = $request->file('dbFile');
                $dbFilename = $reference . '_DB.' . $dbFile->getClientOriginalExtension();
                $dbPath = $dbFile->storeAs('uploads', $dbFilename, 'public');
            }

            // 4. TRIGGER SCANNING ENGINE
            $scanResults = [
                'score' => 100, 
                'issues' => [], 
                'file_tree' => [], 
                'flat_list' => [], 
                'tables' => []
            ];
            
            if ($request->inputType === 'zip') {
                $engine = new ScanningService();
                $scanResults = $engine->runScan($targetValue, $request->scanScope, $dbPath, $request->manualChecks);
            } else {
                $urlEngine = new UrlScanningService();
                $scanResults = $urlEngine->runScan($targetValue);
            }

            // 5. SAVE TO DATABASE (Critical Step)
            try {
                $selectedOptions = json_decode($request->manualChecks, true) ?? [];

                $scan = Scan::create([
                    'scan_reference' => $reference,
                    'target_type' => $request->inputType,
                    'target_value' => (string) $targetValue,
                    'selected_options' => $selectedOptions,
                    'status' => 'completed',
                    'score' => $scanResults['score'],
                    'results' => $scanResults['issues'] // Array will be cast to JSON automatically by Model
                ]);

                // Update User Limit
                if ($user && $user->plan_type === 'free') {
                    $user->increment('daily_scans_count');
                }

                // Log Success
                Log::info("Scan Saved Successfully: " . $scan->id);

            } catch (\Exception $dbError) {
                Log::error("Database Save Failed: " . $dbError->getMessage());
                // Note: Continue execution to show results even if save fails, but log it.
            }

            // 6. Return Response to Frontend
            return response()->json([
                'success' => true,
                'message' => 'Scan Completed Successfully',
                'scan_id' => $reference,
                'results' => $scanResults['issues'],
                'file_tree' => $scanResults['file_tree'] ?? [],
                'flat_list' => $scanResults['flat_list'] ?? [], 
                'tables' => $scanResults['tables'] ?? [] 
            ], 201);

        } catch (\Exception $e) {
            Log::error("Scan Controller Error: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server Error: ' . $e->getMessage()
            ], 500);
        }
    }

    // 🔍 GET SCAN RESULTS (For Dashboard)
    public function show($id)
    {
        $scan = Scan::where('scan_reference', $id)->first();

        if (!$scan) {
            return response()->json(['success' => false, 'message' => 'Scan report not found'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $scan
        ]);
    }

    // 📜 GET HISTORY LIST (For Reports Page)
    public function index()
    {
        $scans = Scan::orderBy('created_at', 'desc')->take(50)->get();
        return response()->json([
            'success' => true,
            'data' => $scans
        ]);
    }

    // 🗑️ DELETE ALL HISTORY
    public function destroyAll()
    {
        try {
            Scan::truncate();
            $files = Storage::allFiles('public/uploads');
            Storage::delete($files);
            return response()->json(['success' => true, 'message' => 'History Cleared Successfully']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to clear history'], 500);
        }
    }
}