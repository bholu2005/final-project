<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('monitors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name'); // Project Name
            $table->string('target'); // URL or Path
            $table->string('type'); // 'url' or 'zip' (zip means server path)
            $table->string('frequency')->default('daily'); // daily, weekly
            $table->timestamp('last_scan_at')->nullable();
            $table->string('status')->default('active'); // active, paused
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('monitors');
    }
};