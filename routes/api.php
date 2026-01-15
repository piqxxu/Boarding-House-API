<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\AuthController;

// Route Public (Siapapun boleh akses)
Route::get('/rooms', [RoomController::class, 'index']);
Route::post('/login', [AuthController::class, 'login']);



// Route Private (Harus punya Token)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/rooms', [RoomController::class, 'store']); //Add
    Route::get('/rooms/{id}', [RoomController::class, 'show']); // Lihat Detail
    Route::put('/rooms/{id}', [RoomController::class, 'update']); // Edit
    Route::delete('/rooms/{id}', [RoomController::class, 'destroy']); // Hapus
    // Route::post('/tenants', [TenantController::class, 'store']); //Check-in
    Route::post('/tenants', [\App\Http\Controllers\Api\TenantController::class, 'store']);
    Route::post('/logout', [AuthController::class, 'logout']); //Logout
});