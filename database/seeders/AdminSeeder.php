<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // Update existing or create new Admin 1
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

        // Update existing or create new Admin 2 (bxyz9576@gmail.com)
        User::updateOrCreate(
            ['email' => 'bxyz9576@gmail.com'],
            [
                'name' => 'Super Admin 2',
                'password' => Hash::make('ADMIN@123'), // Change later
                'role' => 'admin',     // 🔥 MAIN POWER
                'plan_type' => 'diamond',
                'security_question' => 'admin',
                'security_answer' => 'admin'
            ]
        );
    }
}