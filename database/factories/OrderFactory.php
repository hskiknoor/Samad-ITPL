<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory
{
    public function definition(): array
    {
        return ['reference' => fake()->uuid(), 'name' => fake()->name(), 'email' => fake()->email(), 'address' => fake()->address(), 'items' => [], 'total_cents' => 10000, 'currency' => 'INR', 'status' => 'new'];
    }
}
