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
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name'); // Netflix, Spotify, etc.
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('USD');
            $table->enum('billing_cycle', ['daily', 'weekly', 'monthly', 'yearly']);
            $table->date('next_billing_date');
            $table->string('category')->nullable(); // Entertainment, Productivity, etc.
            $table->string('merchant_name')->nullable();
            $table->text('description')->nullable();
            $table->enum('status', ['active', 'cancelled', 'paused'])->default('active');
            $table->enum('detection_method', ['plaid', 'manual'])->default('manual');
            $table->string('plaid_transaction_id')->nullable();
            $table->boolean('is_shared')->default(false);
            $table->timestamps();
            
            $table->index(['user_id', 'status']);
            $table->index('next_billing_date');
        });
    }

    public function down()
    {
        Schema::dropIfExists('subscriptions');
    }
};
