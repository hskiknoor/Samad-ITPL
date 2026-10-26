<?php

namespace Tests\Feature;

use App\Models\Entry;
use App\Models\Report;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PlatformTest extends TestCase
{
    public function test_disabling_modules_hides_routes_search_and_discovery_without_deleting_content(): void
    {
        $post = Entry::factory()->published()->create(['title' => 'Hidden publishing topic']);
        $product = Entry::factory()->product()->published()->create();
        $admin = User::factory()->create(['role' => 'admin']);
        $modules = [...Setting::site()['modules'], 'publishing' => false, 'commerce' => false, 'reports' => false, 'assistant' => false];
        $this->actingAs($admin)->put('/admin/platform/modules', ['modules' => $modules])->assertSessionHasNoErrors();
        $this->get('/journal')->assertNotFound();
        $this->get('/shop')->assertNotFound();
        $this->get($post->public_path)->assertNotFound();
        $this->get($product->public_path)->assertNotFound();
        $this->get('/reports')->assertNotFound();
        $this->postJson('/assistant', ['question' => 'Hidden publishing topic'])->assertNotFound();
        $this->get('/llms.txt')->assertDontSee($post->title);
        $this->get('/sitemap.xml')->assertDontSee($post->slug)->assertDontSee($product->slug);
        $this->assertDatabaseCount('entries', 2);
    }

    public function test_platform_and_private_report_management_require_an_administrator(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'editor']));
        $this->get('/admin/platform')->assertForbidden();
        $this->get('/admin/reports')->assertForbidden();
        $this->put('/admin/platform/modules', ['modules' => Setting::site()['modules']])->assertForbidden();
    }

    public function test_llm_files_include_only_published_public_indexable_information(): void
    {
        $visible = Entry::factory()->published()->create(['title' => 'Public studio information']);
        $draft = Entry::factory()->create(['title' => 'Private unreleased content']);
        $noindex = Entry::factory()->published()->create(['noindex' => true]);
        $private = Report::factory()->create(['audience' => 'customer', 'owner_id' => User::factory()->create(['role' => 'customer'])->id]);
        $report = Report::factory()->create(['title' => 'Public annual resource']);
        $this->get('/llms.txt')->assertOk()->assertSee($visible->title)->assertSee($report->title)->assertDontSee($draft->title)->assertDontSee($noindex->title)->assertDontSee($private->title);
        $this->get('/llms-full.txt')->assertOk()->assertSee($visible->body);
        $this->get('/llm.txt')->assertRedirect('/llms.txt')->assertStatus(301);
        $this->get('/feed.xml')->assertOk()->assertSee($visible->title)->assertDontSee($draft->title);
    }

    public function test_discovery_settings_update_keywords_verification_and_robots(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']))->put('/admin/platform/discovery', ['home_page_id' => null, 'seo_keywords' => 'design, stores', 'google_verification' => 'google-token', 'bing_verification' => 'bing-token', 'robots_disallow' => ['/preview'], 'social_image_id' => null])->assertSessionHasNoErrors();
        $this->assertSame('design, stores', Setting::site()['seo_keywords']);
        $this->get('/robots.txt')->assertSee('Disallow: /preview')->assertSee('Disallow: /account');
        $this->get('/')->assertInertia(fn (Assert $page) => $page->where('seo.keywords', 'design, stores'));
    }

    public function test_page_sections_and_canonical_metadata_are_saved_and_exposed(): void
    {
        $entry = Entry::factory()->published()->create(['type' => 'page']);
        $payload = ['type' => 'page', 'title' => 'Services', 'slug' => $entry->slug, 'status' => 'published', 'body' => 'Our services.', 'noindex' => false, 'price_cents' => 0, 'stock' => 0, 'seo_keywords' => 'service, design', 'canonical_url' => 'https://example.com/services', 'blocks' => [['type' => 'faq', 'heading' => 'Questions', 'items' => [['title' => 'Can you help?', 'text' => 'Yes, get in touch.']]]]];
        $this->actingAs(User::factory()->create(['role' => 'editor']))->put('/admin/content/'.$entry->id, $payload)->assertSessionHasNoErrors();
        $this->get($entry->public_path)->assertInertia(fn (Assert $page) => $page->where('seo.canonical', 'https://example.com/services')->where('seo.keywords', 'service, design')->where('entry.blocks.0.type', 'faq')->where('seo.schema.@graph.2.@type', 'FAQPage'));
        $this->get('/sitemap.xml')->assertDontSee($entry->slug);
    }

    public function test_a_selected_published_page_can_be_the_custom_homepage(): void
    {
        $entry = Entry::factory()->published()->create(['type' => 'page', 'title' => 'Client custom homepage']);
        Setting::create(['key' => 'site', 'value' => [...Setting::site(), 'home_page_id' => $entry->id]]);
        $this->get('/')->assertInertia(fn (Assert $page) => $page->component('Public/Entry')->where('entry.title', 'Client custom homepage')->where('seo.canonical', url('/')));
    }

    public function test_redirects_work_on_old_urls_and_reject_loops_and_account_routes(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']));
        $this->post('/admin/redirects', ['from_path' => '/old-page', 'to_path' => '/contact', 'status' => 301])->assertSessionHasNoErrors();
        $this->get('/old-page')->assertStatus(301)->assertRedirect('/contact');
        $this->post('/admin/redirects', ['from_path' => '/contact', 'to_path' => '/old-page', 'status' => 301])->assertSessionHasErrors('to_path');
        $this->post('/admin/redirects', ['from_path' => '/account', 'to_path' => '/contact', 'status' => 302])->assertSessionHasErrors('from_path');
        $this->post('/admin/redirects', ['from_path' => '/external', 'to_path' => '//example.com', 'status' => 302])->assertSessionHasErrors('to_path');
    }

    public function test_report_upload_is_private_until_publication(): void
    {
        Storage::fake('local');
        $this->actingAs(User::factory()->create(['role' => 'admin']))->post('/admin/reports', ['title' => 'Helpful guide', 'slug' => 'helpful-guide', 'summary' => 'A public guide to our services.', 'status' => 'draft', 'audience' => 'public', 'noindex' => false, 'file' => UploadedFile::fake()->createWithContent('guide.txt', 'Published website resource')])->assertSessionHasNoErrors();
        $report = Report::firstOrFail();
        Storage::disk('local')->assertExists($report->getRawOriginal('file_path'));
        $this->get('/reports/helpful-guide/download')->assertNotFound();
        $this->patch('/admin/reports/'.$report->id, ['status' => 'published'])->assertSessionHasNoErrors();
        $this->get('/reports/helpful-guide/download')->assertOk()->assertDownload('guide.txt');
    }

    public function test_report_metadata_can_be_updated_without_reuploading_its_file(): void
    {
        $report = Report::factory()->create();
        $path = $report->getRawOriginal('file_path');
        $this->actingAs(User::factory()->create(['role' => 'admin']))->patch('/admin/reports/'.$report->id, ['title' => 'Updated website guide', 'summary' => 'Updated website information.', 'content' => 'New searchable facts.', 'status' => 'published'])->assertSessionHasNoErrors();
        $this->assertSame('Updated website guide', $report->fresh()->title);
        $this->assertSame($path, $report->fresh()->getRawOriginal('file_path'));
    }

    public function test_customer_only_report_updates_require_an_assigned_customer(): void
    {
        $report = Report::factory()->create();
        $this->actingAs(User::factory()->create(['role' => 'admin']))->patch('/admin/reports/'.$report->id, ['status' => 'published', 'audience' => 'customer', 'owner_id' => null])->assertSessionHasErrors('owner_id');
        $this->assertSame('public', $report->fresh()->audience);
    }
}
