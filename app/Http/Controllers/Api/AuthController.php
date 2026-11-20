<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Str;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email:rfc,dns|unique:users,email',
            'password' => ['required', 'string', Password::min(8)->letters()->numbers()->symbols()],
            'security_question' => 'required|string|max:255',
            'security_answer' => 'required|string|max:255',
            'captcha_key' => 'required|string|max:128',
            'captcha_answer' => 'required|string|max:20',
        ]);

        $captcha = app(CaptchaController::class);
        if (! $captcha->verify($validated['captcha_key'], $validated['captcha_answer'])) {
            return response()->json(['success' => false, 'message' => 'The verification code is invalid or expired.'], 422);
        }

        $adminEmails = array_filter(array_map('trim', explode(',', (string) config('services.admin_emails', ''))));
        $isAdminEmail = in_array(strtolower($validated['email']), array_map('strtolower', $adminEmails), true);

        $user = User::create([
            'name' => $validated['name'],
            'email' => strtolower($validated['email']),
            'password' => Hash::make($validated['password']),
            'security_question' => $validated['security_question'],
            'security_answer' => Hash::make(strtolower(trim($validated['security_answer']))),
            'phone' => $request->input('phone'),
            'dob' => $request->input('dob'),
            'gender' => $request->input('gender', 'Other'),
            'address' => $request->input('address'),
            'city' => $request->input('city'),
            'state' => $request->input('state'),
            'pincode' => $request->input('pincode'),
            'plan_type' => $isAdminEmail ? 'diamond' : 'free',
            'role' => $isAdminEmail ? 'admin' : 'user',
            'daily_scans_count' => 0,
            'last_scan_date' => now()->toDateString(),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;
        return response()->json(['success' => true, 'message' => 'Account created.', 'user' => $user, 'token' => $token], 201);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
            'captcha_key' => 'nullable|string|max:128',
            'captcha_answer' => 'nullable|string|max:20',
        ]);

        if (! empty($validated['captcha_key'])) {
            if (! app(CaptchaController::class)->verify($validated['captcha_key'], $validated['captcha_answer'] ?? '')) {
                return response()->json(['success' => false, 'message' => 'The verification code is invalid or expired.'], 422);
            }
        }

        $user = User::where('email', strtolower($validated['email']))->first();
        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return response()->json(['success' => false, 'message' => 'Invalid email or password'], 401);
        }

        $adminEmails = array_filter(array_map('trim', explode(',', (string) config('services.admin_emails', ''))));
        if (in_array(strtolower($user->email), array_map('strtolower', $adminEmails), true)) {
            $user->forceFill(['plan_type' => 'diamond', 'role' => 'admin'])->save();
        }

        $token = $user->createToken('auth_token')->plainTextToken;
        return response()->json(['success' => true, 'message' => 'Login successful', 'user' => $user, 'token' => $token]);
    }

    public function githubRedirect(Request $request)
    {
        $clientId = config('services.github.client_id');
        $secret = config('services.github.client_secret');
        if (! $clientId || ! $secret) {
            return response()->json(['success' => false, 'message' => 'GitHub OAuth is not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.'], 503);
        }

        $state = bin2hex(random_bytes(24));
        Cache::put('github_oauth_state_'.$state, true, 600);
        $query = http_build_query([
            'client_id' => $clientId,
            'redirect_uri' => config('services.github.redirect'),
            'scope' => 'read:user user:email',
            'state' => $state,
        ]);

        return response()->json(['success' => true, 'url' => 'https://github.com/login/oauth/authorize?'.$query]);
    }

    public function githubCallback(Request $request)
    {
        $state = $request->query('state');
        $cacheKey = 'github_oauth_state_'.$state;
        if (! $state || ! Cache::pull($cacheKey)) {
            return response()->json(['success' => false, 'message' => 'Invalid or expired GitHub OAuth state.'], 400);
        }
        $code = $request->query('code');
        if (! $code) {
            return response()->json(['success' => false, 'message' => 'GitHub did not return an authorization code.'], 400);
        }

        $tokenResponse = Http::asForm()->acceptJson()->timeout(20)->post('https://github.com/login/oauth/access_token', [
            'client_id' => config('services.github.client_id'),
            'client_secret' => config('services.github.client_secret'),
            'code' => $code,
            'redirect_uri' => config('services.github.redirect'),
        ]);
        $accessToken = $tokenResponse->json('access_token');
        if (! $accessToken) {
            Log::warning('GitHub OAuth token exchange failed');
            return response()->json(['success' => false, 'message' => 'GitHub authentication failed.'], 502);
        }

        $profile = Http::withToken($accessToken)->acceptJson()->timeout(20)->get('https://api.github.com/user')->json();
        $githubId = (string) ($profile['id'] ?? '');
        if (! $githubId) {
            return response()->json(['success' => false, 'message' => 'GitHub profile could not be verified.'], 502);
        }

        $email = $profile['email'] ?? null;
        if (! $email) {
            $emails = Http::withToken($accessToken)->acceptJson()->timeout(20)->get('https://api.github.com/user/emails')->json();
            foreach ($emails as $entry) {
                if (($entry['primary'] ?? false) && ($entry['verified'] ?? false)) {
                    $email = $entry['email'];
                    break;
                }
            }
        }
        if (! $email) {
            return response()->json(['success' => false, 'message' => 'A verified email address is required from GitHub.'], 422);
        }

        $user = User::where('github_id', $githubId)->orWhere('email', strtolower($email))->first();
        if (! $user) {
            $user = User::create([
                'name' => $profile['name'] ?: ($profile['login'] ?? 'GitHub User'),
                'email' => strtolower($email),
                'password' => Hash::make(bin2hex(random_bytes(32))),
                'plan_type' => 'free',
                'role' => 'user',
                'daily_scans_count' => 0,
                'last_scan_date' => now()->toDateString(),
            ]);
        }
        $user->forceFill([
            'github_id' => $githubId,
            'github_username' => $profile['login'] ?? null,
            'github_avatar' => $profile['avatar_url'] ?? null,
        ])->save();

        $token = $user->createToken('github_auth')->plainTextToken;
        return response()->json(['success' => true, 'user' => $user, 'token' => $token]);
    }

    public function getSecurityQuestion(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        $user = User::where('email', strtolower($request->email))->first();
        if (! $user) return response()->json(['success' => false, 'message' => 'Email not found'], 404);
        return response()->json(['success' => true, 'question' => $user->security_question]);
    }

    public function verifyAnswerAndSendOtp(Request $request)
    {
        $request->validate(['email' => 'required|email', 'answer' => 'required|string|max:255']);
        $user = User::where('email', strtolower($request->email))->first();
        if (! $user || ! $user->security_answer || ! Hash::check(strtolower(trim($request->answer)), $user->security_answer)) {
            return response()->json(['success' => false, 'message' => 'Incorrect answer'], 400);
        }

        $otp = (string) random_int(100000, 999999);
        $user->forceFill(['otp' => Hash::make($otp), 'otp_expiry' => now()->addMinutes(10)])->save();
        // Use a configured mail provider to deliver OTP in production. Never return OTP in API responses.
        $user->notify(new \App\Notifications\PasswordResetOtp($otp));
        return response()->json(['success' => true, 'message' => 'If email delivery is configured, an OTP was sent.']);
    }

    public function resetPassword(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
            'new_password' => ['required', 'string', Password::min(8)->letters()->numbers()->symbols()],
        ]);
        $user = User::where('email', strtolower($validated['email']))->first();
        if (! $user || ! $user->otp || ! $user->otp_expiry || now()->greaterThan($user->otp_expiry) || ! Hash::check($validated['otp'], $user->otp)) {
            return response()->json(['success' => false, 'message' => 'Invalid or expired OTP'], 400);
        }
        $user->forceFill(['password' => Hash::make($validated['new_password']), 'otp' => null, 'otp_expiry' => null])->save();
        return response()->json(['success' => true, 'message' => 'Password reset successfully']);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();
        return response()->json(['success' => true]);
    }
}
