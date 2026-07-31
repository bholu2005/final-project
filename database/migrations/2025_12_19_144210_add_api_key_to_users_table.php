<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Agar column pehle se nahi hai to add karo
            if (!Schema::hasColumn('users', 'api_key')) {
                $table->string('api_key')->nullable()->unique()->after('password');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('api_key');
        });
    }
};