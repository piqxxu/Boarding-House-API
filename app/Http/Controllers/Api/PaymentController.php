<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Tenant;
use Illuminate\Http\Request;
use App\Models\AuditLog;

class PaymentController extends Controller
{
    // Read
    public function index()
    {
        // Ambil data pembayaran + info penyewanya + info kamarnya
        $payments = Payment::with(['tenant.user', 'tenant.room'])
            ->latest() 
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
            'paid_at' => $validated['status'] == 'paid' ? now() : null, 
        ]);

        $tenantName = "Unknown";
        $tenant = Tenant::with('user')->find($validated['tenant_id']);
        if ($tenant && $tenant->user) {
            $tenantName = $tenant->user->name;
        }

        AuditLog::create([
            'user_name' => $request->user()->name, 
            'action'    => 'CREATE',
            'target'    => "Payment #{$payment->id}",
            'description' => "Menerima uang Rp " . number_format($payment->amount) . " dari " . $tenantName 
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
            'paid_at' => ($validated['status'] == 'paid' && !$payment->paid_at) ? now() : $payment->paid_at,
        ]);

        AuditLog::create([
            'user_name' => $request->user()->name,
            'action'    => 'UPDATE',
            'target'    => "Payment #{$id}",
            'description' => "Mengubah data pembayaran (Nominal: " . number_format($payment->amount) . ", Status: {$payment->status})"
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Data pembayaran berhasil diupdate!',
            'data' => $payment
        ]);
    }

    // HAPUS DATA 
    public function destroy(Request $request, $id) 
    {
        $payment = Payment::find($id);
        if (!$payment) return response()->json(['message' => 'Not found'], 404);
        
        AuditLog::create([
            'user_name' => $request->user()->name,
            'action'    => 'DELETE',
            'target'    => "Payment #{$id}",
            'description' => "Menghapus data pembayaran sebesar Rp " . number_format($payment->amount)
        ]);

        $payment->delete();
        return response()->json(['status' => 'success', 'message' => 'Data dihapus']);
    }
}