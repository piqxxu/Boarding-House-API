<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Room;
use App\Models\Tenant;
use App\Models\Payment;

class DashboardController extends Controller
{
    public function index()
    {
        $totalRooms = Room::count();

        // Kamar Terisi (Cek kolom status = 'occupied')
        $occupiedRooms = Room::where('status', 'occupied')->count();

        // Total Penyewa Aktif (Cek kolom status = 'active')
        $totalTenants = Tenant::where('status', 'active')->count();

        // Pendapatan Bulan Ini
        $monthlyRevenue = Payment::where('status', 'paid') // Hanya yang lunas
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('amount');


        // DATA TABEL PEMBAYARAN TERBARU
        $recentPayments = Payment::with(['tenant.user', 'tenant.room']) // Eager Load biar query cepet
            ->latest() // Urutkan dari yang terbaru
            ->take(5)  // Ambil 5 aja
            ->get()
            ->map(function ($payment) {
                // Kita ambil data user dari relasi: Payment -> Tenant -> User
                $tenantName = $payment->tenant && $payment->tenant->user 
                    ? $payment->tenant->user->name 
                    : 'Mantan Penghuni'; // Fallback kalau datanya udah diapus

                // Kita ambil nomor kamar dari relasi: Payment -> Tenant -> Room
                $roomNumber = $payment->tenant && $payment->tenant->room 
                    ? $payment->tenant->room->room_number 
                    : 'N/A';

                return [
                    'id' => $payment->id,
                    'tenantName' => $tenantName,
                    'roomNumber' => $roomNumber,
                    'amount' => $payment->amount,
                    'dueDate' => $payment->due_date ?? $payment->created_at->format('Y-m-d'),
                    'status' => ucfirst($payment->status) 
                ];
            });

        return response()->json([
            'stats' => [
                'totalRooms' => $totalRooms,
                'occupiedRooms' => $occupiedRooms,
                'totalTenants' => $totalTenants,
                'monthlyRevenue' => (int) $monthlyRevenue,
            ],
            'recentPayments' => $recentPayments
        ]);
    }
}