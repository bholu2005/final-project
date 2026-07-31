<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Notification;

class NotificationController extends Controller
{
    // Get All Notifications
    public function index()
    {
        // Return latest first
        $notifications = Notification::orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $notifications
        ]);
    }
}