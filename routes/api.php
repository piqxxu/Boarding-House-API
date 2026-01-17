<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\TenantController; 

// ==========================================
// ROUTE PUBLIC (Bebas Akses)
// ==========================================

Route::post('/login', [AuthController::class, 'login']); 
Route::get('/rooms', [RoomController::class, 'index']); 


// ==========================================
// ROUTE PRIVATE (Wajib Token)
// ==========================================
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']); //Logout
    Route::get('/dashboard-stats', [DashboardController::class, 'index']); //Dashboard

    // Manajemen Kamar (Admin Only)
    Route::post('/rooms', [RoomController::class, 'store']); 
    Route::get('/rooms/{id}', [RoomController::class, 'show']);
    Route::put('/rooms/{id}', [RoomController::class, 'update']);
    Route::delete('/rooms/{id}', [RoomController::class, 'destroy']);
    
    // Manajemen Penyewa
    Route::get('/tenants', [TenantController::class, 'index']); // LIHAT DAFTAR
    Route::post('/tenants', [TenantController::class, 'store']); //  TAMBAH
    Route::delete('/tenants/{id}', [TenantController::class, 'destroy']); // HAPUS

    // MANAJEMEN PEMBAYARAN 
    Route::get('/payments', [App\Http\Controllers\Api\PaymentController::class, 'index']);
    Route::post('/payments', [App\Http\Controllers\Api\PaymentController::class, 'store']);
    Route::put('/payments/{id}', [App\Http\Controllers\Api\PaymentController::class, 'update']); 
    Route::delete('/payments/{id}', [App\Http\Controllers\Api\PaymentController::class, 'destroy']);

});