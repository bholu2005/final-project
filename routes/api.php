<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\MonitorController;
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
use App\Http\Controllers\Api\TeamController;
use App\Http\Controllers\Api\AiAssistantController;

Route::get('/captcha', [CaptchaController::class, 'generate']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/auth/github/redirect', [AuthController::class, 'githubRedirect']);
Route::get('/auth/github/callback', [AuthController::class, 'githubCallback']);

Route::post('/forgot/question', [AuthController::class, 'getSecurityQuestion']);
Route::post('/forgot/verify-answer', [AuthController::class, 'verifyAnswerAndSendOtp']);
Route::post('/forgot/reset', [AuthController::class, 'resetPassword']);
Route::post('/tools/headers', [ToolController::class, 'checkHeaders']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', fn (Request $request) => $request->user());

    Route::post('/scan/initiate', [ScanController::class, 'initiate']);
    Route::get('/scans', [ScanController::class, 'index']);
    Route::get('/scan/{id}', [ScanController::class, 'show']);
    Route::delete('/scans/clear', [ScanController::class, 'destroyAll']);
    Route::get('/scan/{id}/download', [ReportController::class, 'download']);

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::post('/profile/update', [ProfileController::class, 'update']);
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/subscription/upgrade', [SubscriptionController::class, 'upgrade']);
    Route::get('/subscription/history', [SubscriptionController::class, 'history']);

    Route::post('/support/create', [SupportController::class, 'store']);
    Route::get('/support/history', [SupportController::class, 'index']);
    Route::get('/developer/key', [ApiKeyController::class, 'index']);
    Route::post('/developer/generate', [ApiKeyController::class, 'generate']);
    Route::post('/developer/revoke', [ApiKeyController::class, 'revoke']);

    Route::get('/team', [TeamController::class, 'index']);
    Route::post('/team/add', [TeamController::class, 'store']);
    Route::delete('/team/{id}', [TeamController::class, 'destroy']);
    Route::get('/monitor/list', [MonitorController::class, 'index']);
    Route::post('/monitor/add', [MonitorController::class, 'store']);
    Route::delete('/monitor/{id}', [MonitorController::class, 'destroy']);
    Route::post('/monitor/{id}/run', [MonitorController::class, 'runNow']);

    Route::post('/ai/chat', [AiAssistantController::class, 'chat']);

    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/stats', [AdminController::class, 'stats']);
        Route::get('/users', [AdminController::class, 'users']);
        Route::get('/scans', [AdminController::class, 'scans']);
        Route::get('/tickets', [AdminController::class, 'tickets']);
        Route::get('/finance', [AdminController::class, 'finance']);
        Route::get('/threat-logs', [AdminController::class, 'threatLogs']);
        Route::get('/feedback', [AdminController::class, 'feedback']);
        Route::post('/users/{id}/delete', [AdminController::class, 'toggleUserStatus']);
        Route::post('/tickets/{id}/close', [AdminController::class, 'closeTicket']);
        Route::get('/settings', [AdminController::class, 'getSettings']);
        Route::post('/settings', [AdminController::class, 'updateSettings']);
    });
});
