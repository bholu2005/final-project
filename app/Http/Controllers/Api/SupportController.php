<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Ticket; // 🔥 Model Import Zaroori Hai

class SupportController extends Controller
{
    // 📝 CREATE TICKET
    public function store(Request $request)
    {
        try {
            $request->validate([
                'subject' => 'required|string|max:255',
                'message' => 'required|string',
                'priority' => 'required|in:low,medium,high'
            ]);

            $ticket = Ticket::create([
                'user_id' => $request->user()->id,
                'subject' => $request->subject,
                'message' => $request->message,
                'priority' => $request->priority,
                'status' => 'open'
            ]);

            return response()->json([
                'success' => true, 
                'message' => 'Ticket Created ID: #' . $ticket->id,
                'data' => $ticket
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false, 
                'message' => 'Database Error: ' . $e->getMessage()
            ], 500);
        }
    }

    // 📜 GET HISTORY
    public function index(Request $request)
    {
        $tickets = Ticket::where('user_id', $request->user()->id)
                         ->orderBy('created_at', 'desc')
                         ->get();

        return response()->json([
            'success' => true,
            'data' => $tickets
        ]);
    }
}