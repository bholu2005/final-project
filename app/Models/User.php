<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        // 1. Basic Auth
        'name',
        'email',
        'password',

        // 2. Profile Details
        'phone',
        'dob',
        'gender',
        'address',
        'city',
        'state',
        'pincode',
        'profile_photo',

        // 3. Security Questions & Recovery
        'security_question',
        'security_answer',
        'otp',
        'otp_expiry',

        // 4. Subscription & Limits
        'plan_type',           // free, silver, gold, platinum, diamond
        'daily_scans_count',   // Track usage for free plan
        'last_scan_date',      // Reset limit daily

        // 5. Developer API
        'api_key',             // For CI/CD & Terminal access
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'security_answer', // Hide security answer for safety
        'otp',             // Hide OTP
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'dob' => 'date',
            'last_scan_date' => 'date',
        ];
    }
}