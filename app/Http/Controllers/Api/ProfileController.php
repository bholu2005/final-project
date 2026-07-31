<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    // GET PROFILE
    public function show(Request $request)
    {
        return response()->json([
            'success' => true,
            'user' => $request->user()
        ]);
    }

    // UPDATE PROFILE
    public function update(Request $request)
    {
        $user = $request->user();

        // Validation
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|digits:10',
            'dob' => 'nullable|date',
            'gender' => 'nullable|string',
            'address' => 'nullable|string',
            'city' => 'nullable|string',
            'state' => 'nullable|string',
            'pincode' => 'nullable|digits:6',
            'profile_photo' => 'nullable|image|max:2048'
        ]);

        // Update Text Fields
        $user->fill($request->except(['profile_photo', 'email'])); // Email change not allowed normally

        // Handle Photo Upload
        if ($request->hasFile('profile_photo')) {
            // Delete old photo if exists
            if ($user->profile_photo) {
                Storage::disk('public')->delete($user->profile_photo);
            }
            
            $path = $request->file('profile_photo')->store('profiles', 'public');
            $user->profile_photo = $path;
        }

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Profile Updated Successfully',
            'user' => $user
        ]);
    }
}