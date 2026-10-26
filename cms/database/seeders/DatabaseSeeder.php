<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Entry;
use App\Models\Media;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            $this->command?->warn('Demo content is only seeded in local and testing environments. Use cms:admin for production.');

            return;
        }
        $admin = User::where('email', 'admin@folio.local')->first();
        if (! $admin) {
            $password = Str::password(24);
            $admin = User::create(['name' => 'Samad', 'email' => 'admin@folio.local', 'password' => $password, 'role' => 'admin']);
            if (app()->environment('local')) {
                Storage::disk('local')->put('local-admin.json', json_encode(['email' => $admin->email, 'password' => $password], JSON_PRETTY_PRINT));
                chmod(Storage::disk('local')->path('local-admin.json'), 0600);
            }
        }
        $categories = [];
        foreach (['Design notes', 'Studio life', 'Resources', 'Considered goods'] as $name) {
            $categories[] = Category::firstOrCreate(['slug' => Str::slug($name)], ['name' => $name]);
        }
        Setting::firstOrCreate(['key' => 'site'], ['value' => Setting::site()]);
        $assets = [];
        foreach (['perspective', 'slow', 'notebook', 'poster', 'identity', 'objects'] as $name) {
            $path = 'demos/'.$name.'.svg';
            if (! Storage::disk('public')->exists($path)) {
                Storage::disk('public')->put($path, file_get_contents(public_path('art/'.$name.'.svg')));
            }
            $assets[$name] = Media::firstOrCreate(['path' => $path], ['name' => $name.'.svg', 'mime' => 'image/svg+xml', 'size' => Storage::disk('public')->size($path), 'alt' => match ($name) {
                'perspective' => 'Geometric green and gold shapes with a fresh perspective', 'slow' => 'A warm terracotta composition celebrating slower days', 'notebook' => 'A green notebook for everyday ideas', 'poster' => 'A limited edition abstract art print', 'identity' => 'A study of shapes and visual identity', default => 'A collection of thoughtful everyday objects'
            }]);
        }
        $body = "## Make space for a different point of view\n\nThe most useful ideas rarely arrive fully formed. They start with a little curiosity, a thoughtful question, and the willingness to look at the familiar in a new way.\n\nAt our studio, we believe good work comes from paying attention. To the details. To the people who use what we make. And to the small moments that can turn a useful thing into something meaningful.\n\n> A little less noise. A little more intention.\n\n## A process with room to breathe\n\nWe start with a conversation, then explore the possibilities together. Sketching, testing, and refining until each decision has a purpose.\n\n- Ask better questions before finding answers.\n- Make simple things work beautifully.\n- Leave room for a happy discovery.\n\nThere is no single formula. Just thoughtful work, honest conversations, and a shared belief that the best is still ahead. [Say hello](/contact) if that sounds like your kind of thing.";
        $definitions = [
            ['title' => 'A different way of seeing things', 'slug' => 'a-different-way-of-seeing-things', 'type' => 'post', 'image' => 'perspective', 'category' => 0, 'excerpt' => 'A few thoughts on curiosity, perspective, and finding the extraordinary in the everyday.', 'status' => 'published', 'days' => -1],
            ['title' => 'In praise of taking it slow', 'slug' => 'in-praise-of-taking-it-slow', 'type' => 'post', 'image' => 'slow', 'category' => 1, 'excerpt' => 'Why a little breathing room might be the most productive thing you do this week.', 'status' => 'published', 'days' => -3],
            ['title' => 'Good ideas need a place to land', 'slug' => 'good-ideas-need-a-place-to-land', 'type' => 'post', 'image' => 'identity', 'category' => 2, 'excerpt' => 'The notebooks, rituals, and small beginnings behind our favorite studio projects.', 'status' => 'published', 'days' => -5],
            ['title' => 'About our little studio', 'slug' => 'about', 'type' => 'page', 'image' => 'objects', 'category' => 1, 'excerpt' => 'A small independent studio. A big belief in the power of thoughtful work.', 'status' => 'published', 'days' => -6],
            ['title' => 'The everyday notebook', 'slug' => 'the-everyday-notebook', 'type' => 'product', 'image' => 'notebook', 'category' => 3, 'excerpt' => 'A quiet space for loud ideas. Lay-flat binding, considered details, and plenty of room to begin.', 'status' => 'published', 'days' => -4, 'price' => 89000],
            ['title' => 'A fresh perspective — art print', 'slug' => 'a-fresh-perspective-art-print', 'type' => 'product', 'image' => 'poster', 'category' => 3, 'excerpt' => 'An original studio composition. A little color, a little curiosity, and a new way to see your space.', 'status' => 'published', 'days' => -2, 'price' => 160000],
            ['title' => 'Small objects, everyday rituals', 'slug' => 'small-objects-everyday-rituals', 'type' => 'post', 'image' => 'objects', 'category' => 1, 'excerpt' => 'The things we surround ourselves with, and the stories they quietly tell.', 'status' => 'draft', 'days' => 0],
            ['title' => 'A new chapter for the studio', 'slug' => 'a-new-chapter-for-the-studio', 'type' => 'post', 'image' => 'identity', 'category' => 1, 'excerpt' => 'Something new is taking shape. A first look at what comes next.', 'status' => 'scheduled', 'days' => 3],
        ];
        foreach ($definitions as $i => $definition) {
            Entry::firstOrCreate(['slug' => $definition['slug']], [
                'title' => $definition['title'], 'type' => $definition['type'], 'status' => $definition['status'],
                'excerpt' => $definition['excerpt'], 'body' => $definition['type'] === 'product' ? "## Considered from the first detail\n\n".$definition['excerpt']."\n\nDesigned in our independent studio with a focus on useful, enduring details. A little everyday inspiration, made to be used and enjoyed.\n\n- Original studio design\n- Carefully chosen materials\n- Packed with care\n\nQuestions? [Get in touch](/contact) and we will be happy to help." : $body,
                'author_id' => $admin->id, 'category_id' => $categories[$definition['category']]->id, 'media_id' => $assets[$definition['image']]->id,
                'tags' => ['Studio', 'Design'], 'seo_title' => Str::limit($definition['title'].' | Studio North', 70, ''), 'seo_description' => $definition['excerpt'],
                'published_at' => $definition['status'] === 'draft' ? null : now()->addDays($definition['days']),
                'price_cents' => $definition['price'] ?? 0, 'stock' => $definition['type'] === 'product' ? 25 : 0,
                'created_at' => now()->subDays($i % 7), 'updated_at' => now()->subHours($i * 4),
            ]);
        }
        $this->command?->info('Demo content is available. Local admin credentials are stored privately in storage/app/private/local-admin.json.');
    }
}
