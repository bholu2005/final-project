<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ToolController extends Controller
{
    // 🛠️ TOOL: HEADER INSPECTOR
    public function checkHeaders(Request $request)
    {
        $request->validate(['url' => 'required|url']);

        try {
            $response = Http::withOptions(['verify' => false])->get($request->url);
            
            return response()->json([
                'success' => true,
                'status' => $response->status(),
                'headers' => $response->headers(),
                'server' => $response->header('Server') ?? 'Hidden/Unknown',
                'ssl' => str_starts_with($request->url, 'https')
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Could not connect to target.'], 500);
        }
    }
}