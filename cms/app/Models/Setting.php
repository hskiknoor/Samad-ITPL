<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = ['key', 'value'];

    protected function casts(): array
    {
        return ['value' => 'array'];
    }

    public static function site(): array
    {
        return array_replace([
            'name' => 'Studio North', 'tagline' => 'Independent by design.',
            'description' => 'A thoughtful studio for ambitious brands. Explore our work, stories, and carefully considered goods.',
            'hero_title' => 'Good things start with a different perspective.',
            'hero_subtitle' => 'We build brands, digital experiences, and things that make a difference. A small independent studio with a big point of view.',
            'contact_email' => 'hello@example.com', 'currency' => 'INR', 'accent' => '#45634b',
            'footer' => 'Made with care. Built to grow.',
            'navigation' => [['label' => 'About', 'url' => '/pages/about'], ['label' => 'Journal', 'url' => '/journal'], ['label' => 'Shop', 'url' => '/shop'], ['label' => 'Contact', 'url' => '/contact']],
        ], static::where('key', 'site')->value('value') ?? []);
    }
}
