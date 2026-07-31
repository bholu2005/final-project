<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('scans', function (Blueprint $table) {
            $table->id();
            $table->string('scan_reference')->unique(); // Unique ID
            $table->string('target_type'); // 'zip' or 'url'
            $table->string('target_value'); // File path
            $table->json('selected_options')->nullable(); // Settings
            $table->string('status')->default('pending');
            $table->integer('score')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scans');
    }
};