<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Entry;
use App\Models\Setting;
use App\Models\Submission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Inertia\Inertia;
use Inertia\Response;

class SiteController extends Controller
{
    public function home(): Response
    {
        return Inertia::render('Public/Home', ['posts' => Entry::visible()->where('type', 'post')->with('media', 'category', 'author:id,name')->latest('published_at')->limit(3)->get(), 'products' => Entry::visible()->where('type', 'product')->with('media')->limit(3)->get(), 'seo' => $this->seo(Setting::site()['name'].' — '.Setting::site()['tagline'], Setting::site()['description'], url('/'))]);
    }

    public function listing(Request $request, string $type = 'post'): Response
    {
        $filters = $request->validate(['q' => ['nullable', 'string', 'max:100'], 'category' => ['nullable', 'string', 'max:100'], 'tag' => ['nullable', 'string', 'max:40']]);
        $query = Entry::visible()->where('type', $type)->with('media', 'category', 'author:id,name');
        $query->when($filters['q'] ?? null, fn ($q, $v) => $q->where(fn ($q) => $q->where('title', 'like', '%'.$v.'%')->orWhere('excerpt', 'like', '%'.$v.'%')));
        $query->when($filters['category'] ?? null, fn ($q, $v) => $q->whereHas('category', fn ($q) => $q->where('slug', $v)));
        $query->when($filters['tag'] ?? null, fn ($q, $v) => $q->whereJsonContains('tags', $v));
        $title = $type === 'product' ? 'The shop' : 'The journal';
        $seo = $this->seo($title.' — '.Setting::site()['name'], $type === 'product' ? 'Considered objects and useful resources, made with care.' : 'Ideas, observations, and stories from our studio.', url($type === 'product' ? '/shop' : '/journal'));
        $seo['noindex'] = $request->hasAny(['q', 'category', 'tag', 'page']);

        return Inertia::render('Public/Listing', ['entries' => $query->latest('published_at')->paginate(9)->withQueryString(), 'categories' => Category::whereHas('entries', fn ($q) => $q->visible()->where('type', $type))->get(), 'type' => $type, 'filters' => $filters, 'seo' => $seo]);
    }

    public function show(string $slug, string $type = 'page'): Response
    {
        $entry = Entry::visible()->where('type', $type)->where('slug', $slug)->with('media', 'category', 'author:id,name')->firstOrFail();
        $seo = $this->seo($entry->seo_title ?: $entry->title.' — '.Setting::site()['name'], $entry->seo_description ?: $entry->excerpt ?: Setting::site()['description'], url($entry->public_path));
        $seo['noindex'] = $entry->noindex;
        $seo['image'] = $entry->media ? url($entry->media->url) : null;
        $seo['type'] = $type === 'post' ? 'article' : 'website';
        if ($type === 'post') {
            $seo['schema'] = ['@context' => 'https://schema.org', '@type' => 'Article', 'headline' => $entry->title, 'description' => $seo['description'], 'datePublished' => $entry->published_at->toIso8601String(), 'dateModified' => $entry->updated_at->toIso8601String(), 'author' => ['@type' => 'Person', 'name' => $entry->author->name], 'mainEntityOfPage' => $seo['canonical']];
        } elseif ($type === 'product') {
            $seo['schema'] = ['@context' => 'https://schema.org', '@type' => 'Product', 'name' => $entry->title, 'description' => $seo['description'], 'image' => $seo['image'], 'offers' => ['@type' => 'Offer', 'url' => $seo['canonical'], 'priceCurrency' => Setting::site()['currency'], 'price' => number_format($entry->price_cents / 100, 2, '.', ''), 'availability' => $entry->stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock']];
        }

        return Inertia::render('Public/Entry', ['entry' => $entry, 'seo' => $seo]);
    }

    public function contact(): Response
    {
        return Inertia::render('Public/Contact', ['seo' => $this->seo('Say hello — '.Setting::site()['name'], 'Have a project in mind? Get in touch with our team.', url('/contact'))]);
    }

    public function submit(Request $request): RedirectResponse
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:100'], 'email' => ['required', 'email', 'max:180'], 'message' => ['required', 'string', 'min:10', 'max:10000'], 'website' => ['nullable', 'string', 'max:0']]);
        Submission::create(collect($data)->only('name', 'email', 'message')->all());

        return back()->with('success', 'Thanks for reaching out. Your message has been received.');
    }

    public function sitemap(): HttpResponse
    {
        $urls = collect(['/', '/journal', '/shop', '/contact'])->map(fn ($path) => ['loc' => url($path), 'lastmod' => null]);
        foreach (Entry::visible()->where('noindex', false)->get() as $entry) {
            $urls->push(['loc' => url($entry->public_path), 'lastmod' => $entry->updated_at->toAtomString()]);
        }

        return response()->view('sitemap', ['urls' => $urls])->header('Content-Type', 'application/xml; charset=UTF-8');
    }

    public function robots(): HttpResponse
    {
        return response("User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /login\nDisallow: /cart\nDisallow: /checkout\nDisallow: /order/\nSitemap: ".url('/sitemap.xml')."\n")->header('Content-Type', 'text/plain');
    }

    private function seo(string $title, string $description, string $canonical): array
    {
        return ['title' => $title, 'description' => $description, 'canonical' => $canonical, 'noindex' => false, 'type' => 'website', 'image' => null, 'schema' => ['@context' => 'https://schema.org', '@type' => 'Organization', 'name' => Setting::site()['name'], 'url' => url('/')]];
    }
}
