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
    Route::post('/logout', [AuthController::class, 'logout']);
    
});
