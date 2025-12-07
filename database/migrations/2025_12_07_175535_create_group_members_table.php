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
        Schema::create('group_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sharing_group_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->decimal('share_amount', 10, 2);
            $table->enum('payment_status', ['pending', 'paid', 'overdue'])->default('pending');
            $table->date('next_payment_date');
            $table->enum('role', ['owner', 'member'])->default('member');
            $table->timestamp('joined_at')->useCurrent();
            $table->timestamps();
            
            $table->unique(['sharing_group_id', 'user_id']);
            $table->index('payment_status');
        });
    }

    public function down()
    {
        Schema::dropIfExists('group_members');
    }
};
