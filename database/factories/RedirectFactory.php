<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class RedirectFactory extends Factory
{
    public function definition(): array
    {
        return ['from_path' => '/'.fake()->unique()->slug(), 'to_path' => '/contact', 'status' => 301];
    }
}
