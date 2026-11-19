<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name', 'email', 'password', 'phone', 'dob', 'gender', 'address', 'city', 'state', 'pincode', 'profile_photo',
        'security_question', 'security_answer', 'otp', 'otp_expiry', 'plan_type', 'daily_scans_count', 'last_scan_date', 'api_key',
    ];

    protected $hidden = ['password', 'remember_token', 'security_answer', 'otp'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'dob' => 'date',
            'last_scan_date' => 'date',
            'last_ai_request_date' => 'date',
        ];
    }

    public function scans(): HasMany
    {
        return $this->hasMany(Scan::class);
    }
}
