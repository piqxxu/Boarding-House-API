<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            // Ini kolom yang tadi dibilang "Not Found"
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            
            $table->decimal('amount', 10, 2); // Kolom Jumlah Uang
            $table->string('status'); // Kolom Status (paid/pending)
            $table->date('due_date'); // Kolom Jatuh Tempo
            $table->timestamp('paid_at')->nullable(); // Kolom Tanggal Bayar
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};