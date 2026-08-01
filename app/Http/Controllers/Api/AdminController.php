<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Scan;
use App\Models\Ticket;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    // --- DASHBOARD STATS ---
    public function stats() {
        return response()->json([
            'users' => User::count(),
            'scans' => Scan::count(),
            'revenue' => Transaction::sum('amount'),
            'tickets' => Ticket::where('status', 'open')->count()
        ]);
    }

    // --- USERS MANAGEMENT ---
    public function users() {
        return response()->json(User::orderBy('created_at', 'desc')->get());
    }

    public function toggleUserStatus($id) {
        $user = User::findOrFail($id);
        // Toggle Logic (Assuming we add 'status' column later, for now we delete or just mock)
        // For now, let's just delete unsafe users
        $user->delete();
        return response()->json(['success' => true, 'message' => 'User Deleted']);
    }

    // --- SCANS ---
    public function scans() {
        return response()->json(Scan::orderBy('created_at', 'desc')->take(50)->get());
    }

    // --- TICKETS ---
    public function tickets() {
        return response()->json(Ticket::with('user')->orderBy('created_at', 'desc')->get());
    }

    public function closeTicket($id) {
        $ticket = Ticket::findOrFail($id);
        $ticket->status = 'closed';
        $ticket->save();
        return response()->json(['success' => true, 'message' => 'Ticket Closed']);
    }

    // --- FINANCE ---
    public function finance() {
        return response()->json(Transaction::with('user')->orderBy('created_at', 'desc')->get());
    }

    // --- SECURITY THREAT LOGS ---
    public function threatLogs() {
        return response()->json(\App\Models\SecurityLog::with('user')->orderBy('created_at', 'desc')->get());
    }

    // --- FEEDBACK LISTING ---
    public function feedback() {
        return response()->json(\App\Models\Feedback::with('user')->orderBy('created_at', 'desc')->get());
    }

    // --- 🔥 SYSTEM SETTINGS (NEW) ---
    public function getSettings() {
        $settings = DB::table('settings')->pluck('value', 'key');
        return response()->json($settings);
    }

    public function updateSettings(Request $request) {
        foreach ($request->all() as $key => $value) {
            DB::table('settings')->updateOrInsert(['key' => $key], ['value' => $value, 'updated_at' => now()]);
        }
        return response()->json(['success' => true, 'message' => 'Settings Updated']);
    }
}