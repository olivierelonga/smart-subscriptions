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
        Schema::create('group_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_member_id')->constrained()->onDelete('cascade');
            $table->foreignId('sharing_group_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->enum('status', ['pending', 'completed', 'failed'])->default('pending');
            $table->string('payment_method')->nullable(); // venmo, paypal, stripe
            $table->string('transaction_id')->nullable();
            $table->date('due_date');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
            
            $table->index(['group_member_id', 'status']);
            $table->index('due_date');
        });
    }

    public function down()
    {
        Schema::dropIfExists('group_payments');
    }
};
