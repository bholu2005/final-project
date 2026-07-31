<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Scan extends Model
{
    use HasFactory;

    protected $fillable = [
        'scan_reference',
        'target_type',
        'target_value',
        'selected_options',
        'status',
        'score',
        'results' // 🔥 Ye Add kiya hai
    ];

    protected $casts = [
        'selected_options' => 'array',
        'results' => 'array', // 🔥 Ye JSON ko Array banayega
    ];
}