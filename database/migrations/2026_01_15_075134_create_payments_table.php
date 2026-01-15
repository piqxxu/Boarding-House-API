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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained()->onDelete('cascade');
            
            $table->decimal('amount_paid', 12, 0);
            $table->string('payment_method')->nullable(); // 'BCA', 'Cash', 'QRIS'
            $table->string('proof_image')->nullable(); // URL foto bukti transfer
            $table->dateTime('paid_at');
            
            // Status verifikasi admin
            $table->enum('status', ['pending', 'verified', 'rejected'])->default('pending')->index();
            $table->string('rejection_reason')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
