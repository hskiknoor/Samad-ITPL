<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ReportFactory extends Factory
{
    public function definition(): array
    {
        return ['title' => fake()->sentence(3), 'slug' => fake()->unique()->slug(), 'summary' => fake()->paragraph(), 'content' => fake()->paragraph(), 'status' => 'published', 'audience' => 'public', 'file_path' => 'reports/sample.pdf', 'original_name' => 'sample.pdf', 'mime' => 'application/pdf', 'size' => 1024, 'noindex' => false, 'published_at' => now()->subDay()];
    }
}
