<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\TeamMember; // 🔥 Use Model
use Illuminate\Support\Facades\Auth;

class TeamController extends Controller
{
    // 📜 GET TEAM LIST
    public function index(Request $request)
    {
        // Get members belonging to logged in user
        $members = TeamMember::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json([
            'success' => true, 
            'data' => $members
        ]);
    }

    // ➕ ADD MEMBER
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'role' => 'required|in:viewer,developer,admin'
        ]);

        $member = TeamMember::create([
            'user_id' => $request->user()->id,
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
            'status' => 'active'
        ]);

        return response()->json([
            'success' => true, 
            'message' => 'Team member added successfully',
            'data' => $member
        ]);
    }

    // ❌ REMOVE MEMBER
    public function destroy($id, Request $request)
    {
        $member = TeamMember::where('id', $id)
            ->where('user_id', $request->user()->id) // Security Check
            ->first();

        if ($member) {
            $member->delete();
            return response()->json(['success' => true, 'message' => 'Member removed']);
        }

        return response()->json(['success' => false, 'message' => 'Member not found'], 404);
    }
}