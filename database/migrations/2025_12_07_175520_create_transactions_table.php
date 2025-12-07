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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('plaid_account_id')->constrained()->onDelete('cascade');
            $table->string('plaid_transaction_id')->unique();
            $table->decimal('amount', 10, 2);
            $table->date('date');
            $table->string('merchant_name');
            $table->string('category')->nullable();
            $table->boolean('is_recurring')->default(false);
            $table->boolean('is_subscription')->default(false);
            $table->foreignId('linked_subscription_id')->nullable()->constrained('subscriptions');
            $table->timestamps();
            
            $table->index(['user_id', 'date']);
            $table->index('merchant_name');
            $table->index('is_recurring');
        });
    }

    public function down()
    {
        Schema::dropIfExists('transactions');
    }
};
