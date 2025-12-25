<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // Modify the enum column to include new types
        DB::statement("ALTER TABLE recommendations MODIFY COLUMN type ENUM('redundant', 'upgrade', 'cancel', 'share', 'anomaly', 'trial_ending', 'bundle')");
    }

    public function down()
    {
        // Revert to original types (Warning: this might fail if data exists with new types)
        DB::statement("ALTER TABLE recommendations MODIFY COLUMN type ENUM('redundant', 'upgrade', 'cancel', 'share')");
    }
};
