<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Scan;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function download(string $id, Request $request)
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }

        $scan = Scan::query()
            ->where('user_id', $user->id)
            ->where('scan_reference', $id)
            ->firstOrFail();

        return Pdf::loadView('reports.scan_report', [
            'scan' => $scan,
            'issues' => $scan->results ?? [],
            'date' => $scan->created_at->format('d M Y, h:i A'),
        ])->download('Merlin_Report_'.$id.'.pdf');
    }
}
