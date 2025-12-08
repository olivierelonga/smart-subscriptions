<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('subscription_plan')->nullable()->after('email');
            $table->string('subscription_status')->default('free')->after('subscription_plan');
            $table->string('payfast_token')->nullable()->after('subscription_status');
            $table->timestamp('subscription_ends_at')->nullable()->after('payfast_token');
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'subscription_plan',
                'subscription_status',
                'payfast_token',
                'subscription_ends_at'
            ]);
        });
    }
};
