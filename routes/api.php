<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RoomController;

Route::get('/rooms', [RoomController::class, 'index']);
