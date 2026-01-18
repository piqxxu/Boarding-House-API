<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Room;
use App\Models\Tenant;
use App\Models\Payment;
use Carbon\Carbon; 

class DashboardController extends Controller
{
    public function index()
    {
        try {
            // 1. STATISTIK DASAR
            $totalRooms = Room::count();
            $occupiedRooms = Room::where('status', 'occupied')->count();
            $totalTenants = Tenant::where('status', 'active')->count();
            
            $monthlyRevenue = Payment::whereMonth('due_date', now()->month)
                ->whereYear('due_date', now()->year)
                ->where('status', 'paid')
                ->sum('amount');

            // 2. LOGIKA REMINDER H-7
            // Kita ambil data, tapi kalau user/room hilang, kita handle di bawah
            $activeTenants = Tenant::with(['user', 'room'])->where('status', 'active')->get();
            $reminders = [];

            foreach ($activeTenants as $tenant) {
                // SKIP jika tanggal tagihan kosong/invalid
                if (empty($tenant->due_date)) continue;

                try {
                    // Pakai blok try-catch per item biar 1 error gak bikin semua crash
                    $dueDateThisMonth = Carbon::createFromDate(null, null, (int)$tenant->due_date);
                    
                    if ($dueDateThisMonth->isPast()) {
                        $nextDueDate = $dueDateThisMonth->copy()->addMonth();
                    } else {
                        $nextDueDate = $dueDateThisMonth;
                    }

                    $daysLeft = now()->diffInDays($nextDueDate, false);

                    if ($daysLeft <= 7) {
                        $reminders[] = [
                            'id' => $tenant->id,
                            // --- BAGIAN INI YANG SERING BIKIN CRASH ---
                            // Kita pakai optional() atau null safe operator (?->)
                            'name' => $tenant->user ? $tenant->user->name : 'Data User Terhapus',
                            'room' => $tenant->room ? $tenant->room->room_number : '?',
                            // -------------------------------------------
                            'dueDate' => $nextDueDate->format('Y-m-d'),
                            'daysLeft' => intval($daysLeft),
                            'statusText' => $daysLeft < 0 ? 'Telat ' . abs(intval($daysLeft)) . ' Hari!' : 'H-' . intval($daysLeft)
                        ];
                    }
                } catch (\Exception $e) {
                    continue; // Kalau hitungan tanggal error, skip aja tenant ini
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
                        // Handle kalau tenant/user/room dihapus
                        'tenantName' => $payment->tenant && $payment->tenant->user ? $payment->tenant->user->name : 'Mantan Penghuni',
                        'roomNumber' => $payment->tenant && $payment->tenant->room ? $payment->tenant->room->room_number : '?',
                        'amount' => $payment->amount,
                        'due_date' => $payment->due_date,
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
                'reminders' => $reminders,
                'recentPayments' => $recentPayments
            ], 200);

        } catch (\Exception $e) {
            // Tangkap error global dan kirim pesan jelas (bukan HTML)
            return response()->json([
                'message' => 'Backend Error: ' . $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }
}