<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // Update existing or create new Admin
        User::updateOrCreate(
            ['email' => 'gajjar12@gmail.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('DHRUV@NK!2'), // Change later
                'role' => 'admin',     // 🔥 MAIN POWER
                'plan_type' => 'diamond',
                'security_question' => 'admin',
                'security_answer' => 'admin'
            ]
        );
    }
}