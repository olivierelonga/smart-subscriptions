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
        Schema::create('sharing_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subscription_id')->constrained()->onDelete('cascade');
            $table->foreignId('owner_id')->constrained('users')->onDelete('cascade');
            $table->string('name'); // "Netflix Family Plan"
            $table->text('description')->nullable();
            $table->decimal('total_cost', 10, 2);
            $table->integer('max_members')->default(5);
            $table->enum('status', ['active', 'full', 'inactive'])->default('active');
            $table->string('invite_code')->unique();
            $table->timestamps();
            
            $table->index('invite_code');
            $table->index(['owner_id', 'status']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('sharing_groups');
    }
};
