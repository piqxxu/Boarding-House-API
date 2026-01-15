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
        Schema::create('tenants', function (Blueprint $table) {
            $table->id();
            // Relasi ke Users & Rooms
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('room_id')->constrained()->onDelete('cascade');
            
            $table->date('start_date'); // Tanggal masuk
            $table->date('end_date')->nullable(); // Tanggal keluar 
            $table->integer('due_date')->default(5); // Tanggal jatuh tempo tiap bulan (misal tgl 5)
            $table->enum('status', ['active', 'history'])->default('active')->index();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
