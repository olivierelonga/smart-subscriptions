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
        Schema::create('recommendations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['redundant', 'upgrade', 'cancel', 'share']);
            $table->string('title');
            $table->text('description');
            $table->decimal('potential_savings', 10, 2);
            $table->json('affected_subscriptions'); // Array of subscription IDs
            $table->enum('status', ['active', 'dismissed', 'completed'])->default('active');
            $table->integer('priority')->default(0); // Higher = more important
            $table->timestamps();
            
            $table->index(['user_id', 'status']);
            $table->index('priority');
        });
    }

    public function down()
    {
        Schema::dropIfExists('recommendations');
    }
};
