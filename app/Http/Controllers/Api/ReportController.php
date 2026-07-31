<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Scan;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

class ReportController extends Controller
{
    public function download($id, Request $request)
    {
        // 1. Authenticate via query token or bearer token
        $user = auth('sanctum')->user();

        if (!$user && $request->has('token')) {
            $tokenModel = PersonalAccessToken::findToken($request->query('token'));
            if ($tokenModel) {
                $user = $tokenModel->tokenable;
            }
        }

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        // 2. Scan Data dhoondo
        $scan = Scan::where('scan_reference', $id)->firstOrFail();

        // 2. Data Prepare karo
        $data = [
            'scan' => $scan,
            'issues' => $scan->results ?? [],
            'date' => $scan->created_at->format('d M Y, h:i A')
        ];

        // 3. PDF Generate karo (View file hum abhi banayenge)
        $pdf = Pdf::loadView('reports.scan_report', $data);

        // 4. Download start karo
        return $pdf->download('Merlin_Report_' . $id . '.pdf');
    }
}