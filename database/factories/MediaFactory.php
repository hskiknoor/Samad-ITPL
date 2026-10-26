<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class MediaFactory extends Factory
{
    public function definition(): array
    {
        return ['name' => 'studio.jpg', 'path' => 'library/studio.jpg', 'mime' => 'image/jpeg', 'size' => 1024, 'alt' => 'A calm studio space'];
    }
}
