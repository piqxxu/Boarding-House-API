<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Room;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    public function index()
    {
        // Get all
        $rooms = Room::all();
        // Kembalikan response JSON
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
            'room_number' => 'required|unique:rooms', // Nomor kamar tidak boleh sama
            'price' => 'required|numeric',
            'status' => 'required|in:available,occupied,maintenance',
            'floor' => 'required',
            'facilities' => 'nullable|string',
        ]);

        // Save to Database
        $room = Room::create($validated);
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
        // Validasi 
        $validated = $request->validate([
            'room_number' => 'sometimes|unique:rooms,room_number,' . $id,
            'price' => 'sometimes|numeric',
            'status' => 'sometimes|in:available,occupied,maintenance',
            'floor' => 'sometimes',
            'facilities' => 'nullable|string',
        ]);

        $room->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Data kamar berhasil diupdate!',
            'data' => $room
        ], 200);
    }

    // Delete
    public function destroy($id)
    {
        $room = Room::find($id);
        if (!$room) {
            return response()->json(['status' => 'error', 'message' => 'Kamar tidak ditemukan'], 404);
        }

        $room->delete(); 

        return response()->json([
            'status' => 'success',
            'message' => 'Kamar berhasil dihapus.'
        ], 200);
    }
}