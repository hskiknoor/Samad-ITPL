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
            'modules' => ['business' => true, 'publishing' => true, 'commerce' => true, 'reports' => true, 'assistant' => true],
            'home_page_id' => null, 'social_image_id' => null, 'seo_keywords' => '', 'robots_disallow' => [], 'google_verification' => '', 'bing_verification' => '',
            'navigation' => [['label' => 'About', 'url' => '/pages/about'], ['label' => 'Journal', 'url' => '/journal'], ['label' => 'Shop', 'url' => '/shop'], ['label' => 'Contact', 'url' => '/contact']],
        ], static::where('key', 'site')->value('value') ?? []);
    }

    public static function enabled(string $module): bool
    {
        return (bool) (static::site()['modules'][$module] ?? false);
    }

    public static function enabledTypes(): array
    {
        return array_keys(array_filter(['page' => static::enabled('business'), 'post' => static::enabled('publishing'), 'product' => static::enabled('commerce')]));
    }

    public static function assistant(): array
    {
        return array_replace(['provider' => 'disabled', 'model' => '', 'welcome' => 'Ask about our website, find a report, or view your own orders.', 'instructions' => 'Be helpful, concise, and answer only questions supported by the website information.'], static::where('key', 'assistant')->value('value') ?? []);
    }
}
