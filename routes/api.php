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

    // --- Team Management (New) ---
    Route::get('/team', [TeamController::class, 'index']);
    Route::post('/team/add', [TeamController::class, 'store']);
    Route::delete('/team/{id}', [TeamController::class, 'destroy']);
    Route::get('/monitor/list', [MonitorController::class, 'index']);
    Route::post('/monitor/add', [MonitorController::class, 'store']);
    Route::delete('/monitor/{id}', [MonitorController::class, 'destroy']);
    Route::post('/monitor/{id}/run', [MonitorController::class, 'runNow']);


Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/stats', [AdminController::class, 'stats']);
    Route::get('/users', [AdminController::class, 'users']);
    Route::get('/scans', [AdminController::class, 'scans']);
    Route::get('/tickets', [AdminController::class, 'tickets']);
    Route::get('/finance', [AdminController::class, 'finance']);
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