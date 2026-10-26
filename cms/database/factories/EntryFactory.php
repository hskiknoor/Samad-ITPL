<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class EntryFactory extends Factory
{
    public function definition(): array
    {
        return ['type' => 'post', 'title' => fake()->sentence(5), 'slug' => fake()->unique()->slug(5), 'status' => 'draft', 'excerpt' => fake()->paragraph(), 'body' => fake()->paragraphs(3, true), 'author_id' => User::factory(), 'tags' => [], 'noindex' => false, 'price_cents' => 150000, 'stock' => 10];
    }

    public function published(): static
    {
        return $this->state(fn () => ['status' => 'published', 'published_at' => now()->subDay()]);
    }

    public function product(): static
    {
        return $this->state(fn () => ['type' => 'product']);
    }
}
