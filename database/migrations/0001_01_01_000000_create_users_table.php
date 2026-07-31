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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            
            // 🔥 DETAILS (Jo aapne mange the)
            $table->string('phone', 10)->nullable();
            $table->date('dob')->nullable();
            $table->string('gender')->nullable();
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('pincode', 6)->nullable();
            $table->string('profile_photo')->nullable();

            // 🔥 SECURITY
            $table->string('security_question')->nullable();
            $table->string('security_answer')->nullable();
            $table->string('otp')->nullable();

            // 🔥 PREMIUM PLAN & LIMITS (Ye Missing Tha)
            $table->string('plan_type')->default('free'); // free, silver, gold, diamond
            $table->integer('daily_scans_count')->default(0);
            $table->date('last_scan_date')->nullable();

            $table->rememberToken();
            $table->timestamps();
        });

        // Password Reset & Sessions Tables (Default Laravel)
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
