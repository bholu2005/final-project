<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\MonitorController;

// Controllers Import
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CaptchaController;
use App\Http\Controllers\Api\ScanController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\SubscriptionController;
use App\Http\Controllers\Api\SupportController;
use App\Http\Controllers\Api\ApiKeyController;
use App\Http\Controllers\Api\ToolController;
use App\Http\Controllers\Api\TeamController; // 🔥 Team Controller Added
use App\Http\Controllers\Api\AiAssistantController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ==========================================
// 1️⃣ PUBLIC ROUTES (No Login Required)
// ==========================================

// Captcha Generation
Route::get('/captcha', [CaptchaController::class, 'generate']);

// Authentication
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Password Recovery
Route::post('/forgot/question', [AuthController::class, 'getSecurityQuestion']);
Route::post('/forgot/verify-answer', [AuthController::class, 'verifyAnswerAndSendOtp']);
Route::post('/forgot/reset', [AuthController::class, 'resetPassword']);

// Live Tools
Route::post('/tools/headers', [ToolController::class, 'checkHeaders']);

// PDF Report Download (Authenticated via query token or session)
Route::get('/scan/{id}/download', [ReportController::class, 'download']);


// ==========================================
// 2️⃣ PROTECTED ROUTES (Login Required)
// ==========================================
Route::middleware('auth:sanctum')->group(function () {
    
    // --- Auth & User ---
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // --- Scanning Engine ---
    Route::post('/scan/initiate', [ScanController::class, 'initiate']); // Start Scan
    Route::get('/scans', [ScanController::class, 'index']);           // History List
    Route::get('/scan/{id}', [ScanController::class, 'show']);        // Scan Result/Dashboard
    Route::delete('/scans/clear', [ScanController::class, 'destroyAll']); // Clear History

    // --- User Profile ---
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::post('/profile/update', [ProfileController::class, 'update']);

    // --- Notifications ---
    Route::get('/notifications', [NotificationController::class, 'index']);

    // --- Subscription & Billing ---
    Route::post('/subscription/upgrade', [SubscriptionController::class, 'upgrade']);
    Route::get('/subscription/history', [SubscriptionController::class, 'history']);

    // --- Help & Support ---
    Route::post('/support/create', [SupportController::class, 'store']);
    Route::get('/support/history', [SupportController::class, 'index']);

    // --- Developer API Keys ---
    Route::get('/developer/key', [ApiKeyController::class, 'index']);
    Route::post('/developer/generate', [ApiKeyController::class, 'generate']);
    Route::post('/developer/revoke', [ApiKeyController::class, 'revoke']);

    // --- Interactive Code Patch Diff ---
    Route::get('/scan/{id}/diff', function ($id) {
        $scan = \App\Models\Scan::where('scan_reference', $id)->firstOrFail();
        $issues = $scan->results ?? [];
        $diffs = [];
        foreach ($issues as $issue) {
            $diffs[] = [
                'id' => $issue['id'] ?? uniqid(),
                'name' => $issue['name'] ?? 'Vulnerability Fix',
                'location' => $issue['location'] ?? 'Unknown',
                'original' => $issue['snippet'] ?? '',
                'patched' => $issue['fix_suggestion'] ?? ''
            ];
        }
        return response()->json(['success' => true, 'diffs' => $diffs]);
    });

    // --- Interactive Feedback Submission ---
    Route::post('/feedback', function (Request $request) {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'category' => 'required|string',
            'comment' => 'required|string',
        ]);
        $feedback = \App\Models\Feedback::create([
            'user_id' => $request->user()?->id,
            'rating' => $request->rating,
            'category' => $request->category,
            'comment' => $request->comment,
            'status' => 'pending'
        ]);
        return response()->json(['success' => true, 'message' => 'Feedback submitted!', 'data' => $feedback], 201);
    });

    // --- Webhook Integrations (Slack/Discord) ---
    Route::get('/integrations', function (Request $request) {
        return response()->json(['success' => true, 'data' => \App\Models\Integration::where('user_id', $request->user()->id)->get()]);
    });
    Route::post('/integrations', function (Request $request) {
        $request->validate([
            'service_name' => 'required|string|in:slack,discord',
            'webhook_url' => 'required|url',
        ]);
        $integration = \App\Models\Integration::updateOrCreate(
            ['user_id' => $request->user()->id, 'service_name' => strtolower($request->service_name)],
            ['webhook_url' => $request->webhook_url, 'is_active' => true]
        );
        return response()->json(['success' => true, 'message' => ucfirst($request->service_name) . ' Integration Saved!', 'data' => $integration]);
    });

    // --- Team Management (New) ---
    Route::get('/team', [TeamController::class, 'index']);
    Route::post('/team/add', [TeamController::class, 'store']);
    Route::delete('/team/{id}', [TeamController::class, 'destroy']);
    Route::get('/monitor/list', [MonitorController::class, 'index']);
    Route::post('/monitor/add', [MonitorController::class, 'store']);
    Route::delete('/monitor/{id}', [MonitorController::class, 'destroy']);
    Route::post('/monitor/{id}/run', [MonitorController::class, 'runNow']);

    // --- AI Chat Assistant ---
    Route::post('/ai/chat', [AiAssistantController::class, 'chat']);


Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/stats', [AdminController::class, 'stats']);
    Route::get('/users', [AdminController::class, 'users']);
    Route::get('/scans', [AdminController::class, 'scans']);
    Route::get('/tickets', [AdminController::class, 'tickets']);
    Route::get('/finance', [AdminController::class, 'finance']);
    Route::get('/threat-logs', [AdminController::class, 'threatLogs']);
    Route::get('/feedback', [AdminController::class, 'feedback']);
    Route::get('/stats', [AdminController::class, 'stats']);
    
    // Users
    Route::get('/users', [AdminController::class, 'users']);
    Route::post('/users/{id}/delete', [AdminController::class, 'toggleUserStatus']);

    // Scans
    Route::get('/scans', [AdminController::class, 'scans']);

    // Tickets
    Route::get('/tickets', [AdminController::class, 'tickets']);
    Route::post('/tickets/{id}/close', [AdminController::class, 'closeTicket']);

    // Finance
    Route::get('/finance', [AdminController::class, 'finance']);

    // 🔥 Settings
    Route::get('/settings', [AdminController::class, 'getSettings']);
    Route::post('/settings', [AdminController::class, 'updateSettings']);

});

});