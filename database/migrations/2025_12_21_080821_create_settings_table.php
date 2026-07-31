<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });

        // Insert Default Settings immediately
        DB::table('settings')->insert([
            ['key' => 'maintenance_mode', 'value' => 'false', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'free_scan_limit', 'value' => '3', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'global_announcement', 'value' => '', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'registration_open', 'value' => 'true', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};