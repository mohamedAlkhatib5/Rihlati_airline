<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Demo accounts.
     *
     * These passwords exist so the project can be opened and explored; a real
     * deployment would seed nothing but a single admin with a rotated secret.
     */
    private const STAFF = [
        ['Rihlati Admin', 'admin@rihlati.demo', User::ROLE_ADMIN, 'Admin@12345'],
        ['Operations Desk', 'staff@rihlati.demo', User::ROLE_STAFF, 'Staff@12345'],
    ];

    private const CUSTOMERS = [
        ['Omar Haddad', 'omar.haddad@example.com'],
        ['Layla Nasser', 'layla.nasser@example.com'],
        ['Yousef Karim', 'yousef.karim@example.com'],
        ['Sara Mansour', 'sara.mansour@example.com'],
        ['Kareem Fadel', 'kareem.fadel@example.com'],
        ['Nour Sabbagh', 'nour.sabbagh@example.com'],
        ['Hassan Darwish', 'hassan.darwish@example.com'],
        ['Maya Khalil', 'maya.khalil@example.com'],
        ['Adam Rahal', 'adam.rahal@example.com'],
        ['Rana Aziz', 'rana.aziz@example.com'],
        ['Tarek Hamdan', 'tarek.hamdan@example.com'],
        ['Dina Shaheen', 'dina.shaheen@example.com'],
    ];

    public function run(): void
    {
        foreach (self::STAFF as [$name, $email, $role, $password]) {
            User::updateOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'role' => $role,
                    'password' => $password,
                    'phone' => '+971 4 555 0101',
                    'is_active' => true,
                    'email_verified_at' => now(),
                ]
            );
        }

        foreach (self::CUSTOMERS as $index => [$name, $email]) {
            User::updateOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'role' => User::ROLE_CUSTOMER,
                    'password' => 'Traveller@123',
                    'phone' => '+971 50 '.str_pad((string) (1000 + $index), 4, '0', STR_PAD_LEFT).' 77'.$index,
                    'is_active' => true,
                    'email_verified_at' => now(),
                ]
            );
        }
    }
}
