<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Monitor;
use App\Models\Scan;
use App\Services\UrlScanningService;
use Illuminate\Support\Str;

class MonitorController extends Controller
{
    // ... index, store, destroy functions same rahenge (agar chahiye to bolna) ...
    public function index(Request $request) {
        return response()->json(['success' => true, 'data' => Monitor::where('user_id', $request->user()->id)->orderBy('created_at', 'desc')->get()]);
    }

    public function store(Request $request) {
        $request->validate(['name' => 'required', 'target' => 'required', 'frequency' => 'required']);
        $monitor = Monitor::create([
            'user_id' => $request->user()->id,
            'name' => $request->name,
            'target' => $request->target,
            'type' => 'url',
            'frequency' => $request->frequency
        ]);
        return response()->json(['success' => true, 'data' => $monitor]);
    }

    public function destroy($id, Request $request) {
        Monitor::where('id', $id)->where('user_id', $request->user()->id)->delete();
        return response()->json(['success' => true]);
    }

    // 🔥 REAL TIME SCAN TRIGGER
    public function runNow($id, Request $request)
    {
        $monitor = Monitor::where('id', $id)->where('user_id', $request->user()->id)->firstOrFail();
        
        try {
            // 1. Run Real Engine
            $service = new UrlScanningService();
            $results = $service->runScan($monitor->target);

            // 2. Generate Reference
            $reference = 'AUTO_' . Str::upper(Str::random(8));

            // 3. Save to History (So it shows on Dashboard)
            Scan::create([
                'scan_reference' => $reference,
                'target_type' => 'url',
                'target_value' => $monitor->target,
                'selected_options' => ['security', 'performance'],
                'status' => 'completed',
                'score' => $results['score'],
                'results' => $results['issues']
            ]);

            // 4. Update Monitor timestamp
            $monitor->update(['last_scan_at' => now()]);

            return response()->json([
                'success' => true, 
                'message' => 'Scan Completed. Results saved to Dashboard.',
                'score' => $results['score']
            ]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Scan Failed: ' . $e->getMessage()], 500);
        }
    }
}