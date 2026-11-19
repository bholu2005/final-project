<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('github_id')->nullable()->unique()->after('email');
            $table->string('github_username')->nullable()->after('github_id');
            $table->string('github_avatar')->nullable()->after('github_username');
            $table->timestamp('otp_expiry')->nullable()->after('otp');
            $table->boolean('mfa_enabled')->default(false)->after('otp_expiry');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['github_id', 'github_username', 'github_avatar', 'otp_expiry', 'mfa_enabled']);
        });
    }
};
