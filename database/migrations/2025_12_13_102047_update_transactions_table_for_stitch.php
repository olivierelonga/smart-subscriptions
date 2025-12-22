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
        Schema::table('transactions', function (Blueprint $table) {
            $table->string('stitch_transaction_id')->nullable()->after('plaid_transaction_id');
            $table->foreignId('bank_account_id')->nullable()->after('plaid_account_id')->constrained()->onDelete('cascade');
            $table->decimal('running_balance', 15, 2)->nullable()->after('amount');
        });
    }

    public function down()
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn(['stitch_transaction_id', 'bank_account_id', 'running_balance']);
        });
    }
};
