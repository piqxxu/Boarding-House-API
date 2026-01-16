<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Room;
use App\Models\Tenant;
use App\Models\Payment;
use Illuminate\Support\Facades\Hash;

class DummyDataSeeder extends Seeder
{
    public function run()
    {
        // 1. Bikin User Penyewa (Kalau belum ada)
        $user = User::firstOrCreate(
            ['email' => 'penyewa@test.com'],
            [
                'name' => 'Budi Santoso',
                'password' => Hash::make('password'),
                'role' => 'tenant', // Pastikan kolom role ada di tabel users
                'phone_number' => '081234567890'
            ]
        );

        // 2. Bikin Kamar (Kalau belum ada)
        $room = Room::firstOrCreate(
            ['room_number' => '101'],
            [
                'price' => 1500000,
                'status' => 'occupied', // Kita set langsung terisi
                'floor' => 1,
                'facilities' => 'AC, Wifi, Kamar Mandi Dalam'
            ]
        );

        // 3. Masukin Budi ke Kamar 101 (Tabel Tenants)
        $tenant = Tenant::create([
            'user_id' => $user->id,
            'room_id' => $room->id,
            'start_date' => now()->subMonth(), // Masuk bulan lalu
            'due_date' => 5, // Bayar tiap tanggal 5
            'status' => 'active'
        ]);

        // 4. Bikin Riwayat Pembayaran (Biar Dashboard ada angkanya)
        Payment::create([
            'tenant_id' => $tenant->id,
            'amount' => 1500000,
            'status' => 'paid',
            'due_date' => now()->format('Y-m-d'), // Jatuh tempo hari ini
            'created_at' => now(), // PENTING: Biar kehitung pendapatan bulan ini
        ]);
        
        Payment::create([
            'tenant_id' => $tenant->id,
            'amount' => 1500000,
            'status' => 'pending',
            'due_date' => now()->addDays(5)->format('Y-m-d'), 
            'created_at' => now(),
        ]);
    }
}