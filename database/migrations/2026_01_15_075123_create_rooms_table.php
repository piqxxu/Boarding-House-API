<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->string('room_number')->unique(); // Misal: A-101
            $table->decimal('price', 12, 0); // 12 digit, 0 desimal
            $table->enum('status', ['available', 'occupied', 'maintenance'])
                ->default('available')
                ->index(); // Indexing 
            $table->string('floor')->nullable(); 
            $table->text('facilities')->nullable(); 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};
