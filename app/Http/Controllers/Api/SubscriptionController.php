<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    public function upgrade(Request $request)
    {
        return response()->json([
            'success' => false,
            'message' => 'Paid checkout is not enabled. Configure a verified payment provider before subscriptions can be activated.',
        ], 503);
    }

    public function history(Request $request)
    {
        $transactions = $request->user()->transactions()->latest()->get();
        return response()->json(['success' => true, 'data' => $transactions]);
    }
}
