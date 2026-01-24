<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\AuditLog;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);
        $user = User::where('email', $request->email)->first();
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Email atau Password salah bro!'
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        AuditLog::create([
            'user_name' => $user->name,
            'action'    => 'LOGIN',
            'target'    => 'System',
            'description' => "User melakukan login ke sistem"
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Login berhasil',
            'data' => [
                'user' => $user,
                'token' => $token, 
            ]
        ], 200);
    }

    public function logout(Request $request)
    {
        AuditLog::create([
            'user_name' => $request->user()->name,
            'action'    => 'LOGOUT',
            'target'    => 'System',
            'description' => "User keluar dari sistem (Logout)"
        ]);

        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logout berhasil']);
    }
}