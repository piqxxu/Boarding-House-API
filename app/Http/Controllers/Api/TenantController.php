<?php

namespace App\Http\Controllers\Api; 
use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Models\Tenant;
use App\Models\User; // Tambah Model User
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class TenantController extends Controller
{
    // 1. LIHAT DAFTAR
    public function index()
    {
        $tenants = Tenant::with(['user', 'room'])->get();
        return response()->json(['status' => 'success', 'data' => $tenants]);
    }

    // 2. CHECK-IN (Sekaligus Buat User Baru)
    public function store(Request $request)
    {
        // Validasi data penghuni & kamar
        $validated = $request->validate([
            // Data User (Opsional kalau user_id ada, tapi kita buat wajib input manual aja biar gampang)
            'name' => 'required|string',
            'email' => 'required|email', 
            'phone_number' => 'required|string',
            
            // Data Sewa
            'room_id' => 'required|exists:rooms,id',
            'start_date' => 'required|date',
            'due_date' => 'required|integer|min:1|max:31',
        ]);

        $room = Room::findOrFail($request->room_id);
        if ($room->status !== 'available') {
            return response()->json(['message' => 'Kamar ini sudah penuh!'], 400);
        }

        try {
            $result = DB::transaction(function () use ($validated, $room) {
                
                // A. CARI ATAU BUAT USER BARU
                // Kita cek berdasarkan email. Kalau ada pake itu, kalau gak ada bikin baru.
                $user = User::firstOrCreate(
                    ['email' => $validated['email']], // Kunci pencarian
                    [
                        'name' => $validated['name'],
                        'phone_number' => $validated['phone_number'],
                        'password' => Hash::make('12345678'), // Default password
                        'role' => 'tenant'
                    ]
                );

                // B. MASUKIN KE TABEL TENANTS
                $tenant = Tenant::create([
                    'user_id' => $user->id,
                    'room_id' => $validated['room_id'],
                    'start_date' => $validated['start_date'],
                    'due_date' => $validated['due_date'],
                    'status' => 'active'
                ]);

                // C. UBAH STATUS KAMAR JADI OCCUPIED
                $room->update(['status' => 'occupied']);

                return $tenant;
            });

            return response()->json([
                'status' => 'success',
                'message' => 'Check-in Berhasil! Penghuni baru ditambahkan.',
                'data' => $result
            ], 201);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal: ' . $e->getMessage()], 500);
        }
    }

    // 3. CHECK-OUT
    public function destroy($id)
    {
        $tenant = Tenant::find($id);
        if (!$tenant) return response()->json(['message' => 'Not found'], 404);

        // Balikin kamar jadi available
        Room::where('id', $tenant->room_id)->update(['status' => 'available']);
        
        $tenant->delete();
        return response()->json(['status' => 'success']);
    }
}