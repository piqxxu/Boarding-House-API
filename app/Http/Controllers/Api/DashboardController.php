<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Room;
use App\Models\Tenant;
use App\Models\Payment;
use Carbon\Carbon; // Library buat manipulasi Tanggal

class DashboardController extends Controller
{
    public function index()
    {
        // 1. STATISTIK DASAR
        $totalRooms = Room::count();
        $occupiedRooms = Room::where('status', 'occupied')->count();
        $totalTenants = Tenant::where('status', 'active')->count();
        
        $monthlyRevenue = Payment::whereMonth('due_date', now()->month)
            ->whereYear('due_date', now()->year)
            ->where('status', 'paid') // Hanya hitung yang lunas
            ->sum('amount');

        // 2. LOGIKA REMINDER H-7 (JATUH TEMPO)
        // Ambil semua penyewa aktif
        $activeTenants = Tenant::with(['user', 'room'])->where('status', 'active')->get();
        $reminders = [];

        foreach ($activeTenants as $tenant) {
            // Tentukan tanggal jatuh tempo bulan ini berdasarkan 'due_date' (tgl 1-31)
            $dueDateThisMonth = Carbon::createFromDate(null, null, $tenant->due_date);
            
            // Kalau tanggal itu sudah lewat (misal skrg tgl 20, jatuh tempo tgl 5),
            // Berarti kita cek target jatuh tempo BULAN DEPAN.
            if ($dueDateThisMonth->isPast()) {
                $nextDueDate = $dueDateThisMonth->copy()->addMonth();
            } else {
                $nextDueDate = $dueDateThisMonth;
            }

            // Hitung selisih hari dari SEKARANG sampai JATUH TEMPO
            $daysLeft = now()->diffInDays($nextDueDate, false); // false = biar bisa minus (kalau telat)

            // KONDISI: Kalau sisa hari antara 0 sampai 7 (H-7) ATAU minus (Telat)
            if ($daysLeft <= 7) {
                $status = $daysLeft < 0 ? 'Telat ' . abs(intval($daysLeft)) . ' Hari!' : 'H-' . intval($daysLeft);
                
                $reminders[] = [
                    'id' => $tenant->id,
                    'name' => $tenant->user->name,
                    'room' => $tenant->room->room_number,
                    'dueDate' => $nextDueDate->format('Y-m-d'), // Format: 2026-02-05
                    'daysLeft' => intval($daysLeft), // Buat logic warna di frontend
                    'statusText' => $status
                ];
            }
        }

        // 3. PEMBAYARAN TERBARU
        $recentPayments = Payment::with(['tenant.user', 'tenant.room'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'tenantName' => $payment->tenant ? $payment->tenant->user->name : 'Mantan Penghuni',
                    'roomNumber' => $payment->tenant ? $payment->tenant->room->room_number : '?',
                    'amount' => $payment->amount,
                    'dueDate' => $payment->due_date,
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
            'reminders' => $reminders, // <-- DATA BARU DIKIRIM KE SINI
            'recentPayments' => $recentPayments
        ]);
    }
}