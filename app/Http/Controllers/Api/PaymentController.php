<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Tenant;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    // Read
    public function index()
    {
        // Ambil data pembayaran + info penyewanya + info kamarnya
        $payments = Payment::with(['tenant.user', 'tenant.room'])
            ->latest() // Urutkan dari yang paling baru
            ->get();

        return response()->json(['status' => 'success', 'data' => $payments]);
    }

    // Add
    public function store(Request $request)
    {
        $validated = $request->validate([
            'tenant_id' => 'required|exists:tenants,id',
            'amount' => 'required|numeric',
            'status' => 'required|in:paid,pending,late',
            'due_date' => 'required|date',
        ]);

        // Simpan ke database
        $payment = Payment::create([
            'tenant_id' => $validated['tenant_id'],
            'amount' => $validated['amount'],
            'status' => $validated['status'],
            'due_date' => $validated['due_date'],
            'paid_at' => $validated['status'] == 'paid' ? now() : null, // Kalau paid, isi tanggal hari ini
        ]);

        return response()->json([
            'status' => 'success', 
            'message' => 'Pembayaran berhasil dicatat!', 
            'data' => $payment
        ], 201);
    }


    // Edit
    public function update(Request $request, $id)
    {
        $payment = Payment::find($id);
        if (!$payment) return response()->json(['message' => 'Not found'], 404);

        $validated = $request->validate([
            'amount' => 'required|numeric',
            'status' => 'required|in:paid,pending,late',
            'due_date' => 'required|date',
        ]);

        // Update data
        $payment->update([
            'amount' => $validated['amount'],
            'status' => $validated['status'],
            'due_date' => $validated['due_date'],
            // Kalau status diganti PAID, otomatis isi tanggal bayar hari ini (kalau tadinya kosong)
            'paid_at' => ($validated['status'] == 'paid' && !$payment->paid_at) ? now() : $payment->paid_at,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Data pembayaran berhasil diupdate!',
            'data' => $payment
        ]);
    }

    // HAPUS DATA 
    public function destroy($id)
    {
        $payment = Payment::find($id);
        if (!$payment) return response()->json(['message' => 'Not found'], 404);
        
        $payment->delete();
        return response()->json(['status' => 'success', 'message' => 'Data dihapus']);
    }
}