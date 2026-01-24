<?php
namespace App\Http\Controllers\Api; 
use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Models\Tenant;
use App\Models\User; 
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\AuditLog;

class TenantController extends Controller
{
    // LIHAT DAFTAR
    public function index()
    {
        $tenants = Tenant::with(['user', 'room'])->get();
        return response()->json(['status' => 'success', 'data' => $tenants]);
    }

    // CHECK-IN 
    public function store(Request $request)
    {
        // Validasi data penghuni & kamar
        $validated = $request->validate([
            // Data User 
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
                
                // CARI ATAU BUAT USER BARU
                $user = User::firstOrCreate(
                    ['email' => $validated['email']], 
                    [
                        'name' => $validated['name'],
                        'phone_number' => $validated['phone_number'],
                        'password' => Hash::make('12345678'), 
                        'role' => 'tenant'
                    ]
                );

                // MASUKIN KE TABEL TENANTS
                $tenant = Tenant::create([
                    'user_id' => $user->id,
                    'room_id' => $validated['room_id'],
                    'start_date' => $validated['start_date'],
                    'due_date' => $validated['due_date'],
                    'status' => 'active'
                ]);

                // UBAH STATUS KAMAR JADI OCCUPIED
                $room->update(['status' => 'occupied']);

                return $tenant;
            });

            AuditLog::create([
            'user_name' => $request->user()->name, 
            'action'    => 'CHECK-IN', 
            'target'    => $user->name, 
            'description' => "Check-in penyewa baru di kamar {$room->room_number}"
        ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Check-in Berhasil! Penghuni baru ditambahkan.',
                'data' => $result
            ], 201);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal: ' . $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
    $tenant = Tenant::with(['user', 'room'])->find($id);
        if (!$tenant) return response()->json(['message' => 'Not found'], 404);

        $namaPenyewa = $tenant->user ? $tenant->user->name : 'Unknown';
        $noKamar = $tenant->room ? $tenant->room->room_number : '?';

        AuditLog::create([
            'user_name' => $request->user()->name,
            'action'    => 'CHECK-OUT',
            'target'    => $namaPenyewa,
            'description' => "Checkout penyewa dari kamar {$noKamar}"
        ]);
        $tenant->delete();
        return response()->json(['status' => 'success']);
    }
}