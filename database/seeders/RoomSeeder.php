<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoomSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
public function run(): void
{
    //dummy
    for ($i = 1; $i <= 10; $i++) {
        \App\Models\Room::create([
            'room_number' => 'A-10' . $i, 
            'price' => 1500000,
            'status' => 'available',
            'floor' => 1,
            'facilities' => 'AC, WiFi, Kamar Mandi Dalam',
        ]);
    }
}
}
