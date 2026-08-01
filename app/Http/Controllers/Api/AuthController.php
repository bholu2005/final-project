<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    // 📝 REGISTER
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => ['required', 'string', Password::min(8)->letters()->numbers()->symbols()],
            'security_question' => 'required|string',
            'security_answer' => 'required|string',
        ]);

        // 🔥 ADMIN LOGIC: Force Diamond Plan for specific emails
        $planType = ($request->email === 'gajjar12@gmail.com' || $request->email === 'bxyz9576@gmail.com') ? 'diamond' : 'free';

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'security_question' => $request->security_question,
            'security_answer' => Hash::make(strtolower(trim($request->security_answer))),
            
            // Optional Fields (Default Null)
            'phone' => $request->phone,
            'dob' => $request->dob,
            'gender' => $request->gender ?? 'Male',
            'address' => $request->address,
            'city' => $request->city,
            'state' => $request->state,
            'pincode' => $request->pincode,
            'profile_photo' => null,

            // 🔥 PLAN SETUP
            'plan_type' => $planType,
            'daily_scans_count' => 0,
            'last_scan_date' => now()->toDateString()
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Account Created! Plan: ' . ucfirst($planType),
            'user' => $user,
            'token' => $token
        ], 201);
    }

    // 🔑 LOGIN (Auto Upgrade Admin)
    public function login(Request $request)
    {
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['success' => false, 'message' => 'Invalid email or password'], 401);
        }

        $user = User::where('email', $request->email)->firstOrFail();

        // 🔥 FIX: Agar Admin login kare, to ensure karo wo Diamond hi ho
        if (($user->email === 'gajjar12@gmail.com' || $user->email === 'bxyz9576@gmail.com') && $user->plan_type !== 'diamond') {
            $user->plan_type = 'diamond';
            $user->save();
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login Successful',
            'user' => $user,
            'token' => $token
        ]);
    }

    // ... (Forgot Password / Security Question functions same as before) ...
    // Note: Isse pura copy karo aur baki functions (getSecurityQuestion, resetPassword etc.)
    // jo pichle response me the wo neeche add kar lena.

    public function getSecurityQuestion(Request $request) {
        $user = User::where('email', $request->email)->first();
        if (!$user) return response()->json(['success' => false, 'message' => 'Email not found'], 404);
        return response()->json(['success' => true, 'question' => $user->security_question]);
    }

    public function verifyAnswerAndSendOtp(Request $request) {
        $user = User::where('email', $request->email)->first();
        if (!Hash::check(strtolower(trim($request->answer)), $user->security_answer)) {
            return response()->json(['success' => false, 'message' => 'Incorrect Answer'], 400);
        }
        $otp = rand(100000, 999999);
        $user->otp = $otp; $user->save();
        return response()->json(['success' => true, 'message' => 'OTP Generated', 'dev_otp' => $otp]);
    }

    public function resetPassword(Request $request) {
        $user = User::where('email', $request->email)->where('otp', $request->otp)->first();
        if (!$user) return response()->json(['success' => false, 'message' => 'Invalid OTP'], 400);
        $user->password = Hash::make($request->new_password); $user->otp = null; $user->save();
        return response()->json(['success' => true, 'message' => 'Password Reset Successfully']);
    }

    public function logout(Request $request) {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['success' => true]);
    }
}