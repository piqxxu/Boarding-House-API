<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Room;
use Illuminate\Http\Request;
use App\Models\AuditLog;

class RoomController extends Controller
{
    public function index()
    {
        // Get all
        $rooms = Room::all();
        return response()->json([
            'status' => 'success',
            'data' => $rooms
        ], 200);
    }

    //ADMIN ONLY
    // Add Room
    public function store(Request $request)
    {
        // Validasi Input 
        $validated = $request->validate([
            'room_number' => 'required|unique:rooms', 
            'price' => 'required|numeric',
            'status' => 'required|in:available,occupied,maintenance',
            'floor' => 'required',
            'facilities' => 'nullable|string',
        ]);

        // Save to Database
        $room = Room::create($validated);
        AuditLog::create([
            'user_name' => $request->user()->name,
            'action'    => 'CREATE',
            'target'    => "Kamar {$room->room_number}",
            'description' => "Menambahkan kamar baru (Lantai {$room->floor})"
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Kamar berhasil ditambahkan!',
            'data' => $room
        ], 201); 
    }

    public function show($id)
    {
        $room = Room::find($id);
        if (!$room) {
            return response()->json(['status' => 'error', 'message' => 'Kamar tidak ditemukan'], 404);
        }
        return response()->json(['status' => 'success', 'data' => $room], 200);
    }

    // Update
    public function update(Request $request, $id)
    {
        $room = Room::find($id);
        if (!$room) {
            return response()->json(['status' => 'error', 'message' => 'Kamar tidak ditemukan'], 404);
        }
        $validated = $request->validate([
            'room_number' => 'sometimes|unique:rooms,room_number,' . $id,
            'price' => 'sometimes|numeric',
            'status' => 'sometimes|in:available,occupied,maintenance',
            'floor' => 'sometimes',
            'facilities' => 'nullable|string',
        ]);

        $room->update($validated);
        AuditLog::create([
            'user_name' => $request->user()->name,
            'action'    => 'UPDATE', 
            'target'    => "Kamar {$room->room_number}",
            'description' => "Update data kamar (Harga: " . number_format($room->price) . ")" 
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Data kamar berhasil diupdate!',
            'data' => $room
        ], 200);
    }

    public function destroy(Request $request, $id)
    {
        $room = Room::find($id);
        if (!$room) {
            return response()->json(['status' => 'error', 'message' => 'Kamar tidak ditemukan'], 404);
        }

        AuditLog::create([
            'user_name' => $request->user()->name,
            'action'    => 'DELETE', 
            'target'    => "Kamar {$room->room_number}",
            'description' => "Menghapus kamar permanen" 
        ]);
        
        $room->delete(); 

        return response()->json([
            'status' => 'success',
            'message' => 'Kamar berhasil dihapus.'
        ], 200);
    }
}