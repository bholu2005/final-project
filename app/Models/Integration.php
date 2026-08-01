<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Integration extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'service_name',
        'webhook_url',
        'is_active',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
