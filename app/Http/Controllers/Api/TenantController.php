<?php

namespace App\Http\Controllers\Api; 
use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TenantController extends Controller
{
    public function store(Request $request)
    {
        // 1. Validasi Input
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'room_id' => 'required|exists:rooms,id',
            'start_date' => 'required|date',
            'due_date' => 'required|integer|min:1|max:31',
        ]);

        // 2. Cek Status Kamar
        $room = Room::findOrFail($request->room_id);
        if ($room->status !== 'available') {
            return response()->json(['message' => 'Waduh, kamar ini sudah penuh atau lagi rusak!'], 400);
        }

        // 3. Mulai Transaksi
        try {
            $result = DB::transaction(function () use ($validated, $room) {
                // A. Masukin data ke tabel tenants
                $tenant = Tenant::create([
                    'user_id' => $validated['user_id'],
                    'room_id' => $validated['room_id'],
                    'start_date' => $validated['start_date'],
                    'due_date' => $validated['due_date'],
                    'status' => 'active'
                ]);

                // B. Ubah status kamar jadi OCCUPIED
                $room->update(['status' => 'occupied']);

                return $tenant;
            });

            return response()->json([
                'status' => 'success',
                'message' => 'Check-in Berhasil! Kamar sekarang statusnya Penuh.',
                'data' => $result
            ], 201);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal: ' . $e->getMessage()], 500);
        }
    }
}