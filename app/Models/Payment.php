<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'amount',
        'status',    // Contoh: 'paid', 'pending', 'late'
        'due_date',  // Tanggal jatuh tempo spesifik (Y-m-d)
        'paid_at',   // Kapan dibayar
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}