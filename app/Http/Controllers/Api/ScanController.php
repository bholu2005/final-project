<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Scan;
use App\Services\ScanningService;
use App\Services\UrlScanningService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

class ScanController extends Controller
{
    private const FREE_DAILY_SCAN_LIMIT = 3;

    public function initiate(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate([
            'inputType' => 'required|in:zip,url',
            'file' => 'required_if:inputType,zip|file|mimes:zip|max:51200',
            'url' => 'required_if:inputType,url|nullable|url|max:2048',
            'dbFile' => 'nullable|file|mimes:sql,txt|max:10240',
            'manualChecks' => 'nullable|string|max:4000',
            'scanScope' => 'nullable|string|in:fullstack,frontend,backend',
        ]);

        if (($validated['inputType'] ?? '') === 'url') {
            return response()->json([
                'success' => false,
                'message' => 'URL scanning is temporarily disabled while outbound URL protections are being hardened. ZIP code scans remain available.',
            ], 503);
        }

        $manualChecks = [];
        if (! empty($validated['manualChecks'])) {
            $manualChecks = json_decode($validated['manualChecks'], true);
            if (! is_array($manualChecks)) {
                return response()->json(['success' => false, 'message' => 'manualChecks must contain a valid JSON object or array.'], 422);
            }
        }

        $isFree = strtolower($user->plan_type ?? 'free') === 'free';
        if ($isFree) {
            $reserved = DB::transaction(function () use ($user) {
                $account = $user->newQuery()->whereKey($user->getKey())->lockForUpdate()->firstOrFail();
                $today = now()->toDateString();
                if ($account->last_scan_date?->toDateString() !== $today) {
                    $account->daily_scans_count = 0;
                    $account->last_scan_date = $today;
                }
                if ($account->daily_scans_count >= self::FREE_DAILY_SCAN_LIMIT) {
                    $account->save();
                    return false;
                }
                $account->daily_scans_count++;
                $account->save();
                return true;
            });

            if (! $reserved) {
                return response()->json([
                    'success' => false,
                    'message' => 'Daily scan limit reached (3/3). Your scans reset at midnight in the application timezone.',
                    'usage' => ['used' => self::FREE_DAILY_SCAN_LIMIT, 'limit' => self::FREE_DAILY_SCAN_LIMIT],
                ], 429);
            }
        }

        $reference = 'SCAN_'.Str::upper(Str::random(10));
        $storedPaths = [];

        try {
            // Store user archives privately; never publish source-code uploads under public/storage.
            $archive = $request->file('file');
            $archivePath = $archive->storeAs('scan-uploads/'.$user->id, $reference.'.zip', 'local');
            $storedPaths[] = $archivePath;

            $dbPath = null;
            if ($request->hasFile('dbFile')) {
                $dbPath = $request->file('dbFile')->storeAs('scan-uploads/'.$user->id, $reference.'_DB.sql', 'local');
                $storedPaths[] = $dbPath;
            }

            $scan = Scan::create([
                'user_id' => $user->id,
                'scan_reference' => $reference,
                'target_type' => 'zip',
                'target_value' => $archivePath,
                'selected_options' => $manualChecks,
                'status' => 'processing',
            ]);

            // The archive scanner receives only a server-generated path in the private local disk.
            $results = (new ScanningService())->runScan($archivePath, $validated['scanScope'] ?? 'fullstack', $dbPath, $manualChecks);
            $scan->update([
                'status' => 'completed',
                'score' => $results['score'] ?? null,
                'results' => $results['issues'] ?? [],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Scan completed.',
                'scan_id' => $reference,
                'results' => $results['issues'] ?? [],
                'file_tree' => $results['file_tree'] ?? [],
                'flat_list' => $results['flat_list'] ?? [],
                'tables' => $results['tables'] ?? [],
                'usage' => $isFree ? ['used' => $user->fresh()->daily_scans_count, 'limit' => self::FREE_DAILY_SCAN_LIMIT] : null,
            ], 201);
        } catch (Throwable $exception) {
            foreach ($storedPaths as $path) {
                Storage::disk('local')->delete($path);
            }
            if (isset($scan)) {
                $scan->update(['status' => 'failed']);
            }
            if ($isFree) {
                $user->newQuery()->whereKey($user->getKey())->where('last_scan_date', now()->toDateString())->where('daily_scans_count', '>', 0)->decrement('daily_scans_count');
            }

            Log::warning('Scan failed', ['user_id' => $user->id, 'exception' => $exception::class]);
            return response()->json(['success' => false, 'message' => 'The scan could not be completed. Check that the archive is valid and try again.'], 422);
        }
    }

    public function show(Request $request, string $id)
    {
        $scan = $request->user()->scans()->where('scan_reference', $id)->first();
        if (! $scan) {
            return response()->json(['success' => false, 'message' => 'Scan report not found.'], 404);
        }
        return response()->json(['success' => true, 'data' => $scan]);
    }

    public function index(Request $request)
    {
        $scans = $request->user()->scans()->latest()->limit(50)->get();
        return response()->json(['success' => true, 'data' => $scans]);
    }

    public function destroyAll(Request $request)
    {
        $user = $request->user();
        $scans = $user->scans()->get(['id', 'target_value']);
        $paths = $scans->pluck('target_value')->filter()->all();

        DB::transaction(function () use ($user) {
            $user->scans()->delete();
        });

        foreach ($paths as $path) {
            if (Str::startsWith($path, 'scan-uploads/'.$user->id.'/')) {
                Storage::disk('local')->delete($path);
            }
        }

        return response()->json(['success' => true, 'message' => 'Your scan history was cleared.']);
    }
}
