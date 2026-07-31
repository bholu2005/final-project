<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Transaction;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class SubscriptionController extends Controller
{
    // 💳 UPGRADE PLAN
    public function upgrade(Request $request)
    {
        $request->validate([
            'plan_name' => 'required|string|in:silver,gold,platinum,diamond,Silver,Gold,Platinum,Diamond',
            'amount' => 'required|numeric|min:0',
        ]);

        try {
            $user = $request->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 401);
            }

            $planName = strtolower($request->plan_name);
            $amount = $request->amount;

            // Update user plan
            $user->plan_type = $planName;
            $user->save();

            // Create Transaction record
            $transaction = Transaction::create([
                'user_id' => $user->id,
                'invoice_id' => 'INV-' . Str::upper(Str::random(8)),
                'plan_name' => $planName,
                'amount' => $amount,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Subscription upgraded successfully to ' . ucfirst($planName),
                'user' => $user,
                'transaction' => $transaction
            ], 200);

        } catch (\Exception $e) {
            Log::error('Subscription upgrade error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to upgrade subscription'
            ], 500);
        }
    }

    // 📜 SUBSCRIPTION TRANSACTION HISTORY
    public function history(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 401);
            }

            $transactions = Transaction::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $transactions
            ], 200);

        } catch (\Exception $e) {
            Log::error('Subscription history error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve transaction history'
            ], 500);
        }
    }
}
