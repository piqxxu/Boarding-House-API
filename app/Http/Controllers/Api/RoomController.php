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
}