<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ApiKeyController extends Controller
{
    // GET KEY
    public function index(Request $request)
    {
        return response()->json([
            'success' => true,
            'api_key' => $request->user()->api_key
        ]);
    }

    // GENERATE NEW KEY
    public function generate(Request $request)
    {
        try {
            $user = $request->user();
            // Generate Key: sk_live_RANDOMSTRING
            $newKey = 'sk_live_' . Str::random(32);
            
            // Save to DB
            $user->api_key = $newKey;
            $user->save(); // Ye line fail ho rahi thi agar column nahi tha

            return response()->json([
                'success' => true,
                'message' => 'New API Key Generated',
                'api_key' => $newKey
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false, 
                'message' => 'DB Error: ' . $e->getMessage()
            ], 500);
        }
    }

    // REVOKE KEY
    public function revoke(Request $request)
    {
        $user = $request->user();
        $user->api_key = null;
        $user->save();

        return response()->json(['success' => true, 'message' => 'API Key Revoked']);
    }
}