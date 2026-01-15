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
}