<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Notification;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        Notification::create([
            'title' => 'System Update v2.4',
            'message' => 'New AI Engine integrated for faster scanning. Check Settings to enable.',
            'type' => 'info'
        ]);
        Notification::create([
            'title' => 'Security Alert',
            'message' => 'New SQL Injection pattern detected in global database. Engine updated.',
            'type' => 'alert'
        ]);
        Notification::create([
            'title' => 'Welcome to Merlin',
            'message' => 'Your account has been successfully verified. Start your first scan now.',
            'type' => 'success'
        ]);
        Notification::create([
            'title' => 'Maintenance Scheduled',
            'message' => 'Servers will undergo maintenance on Sunday at 2:00 AM UTC.',
            'type' => 'warning'
        ]);
    }
}