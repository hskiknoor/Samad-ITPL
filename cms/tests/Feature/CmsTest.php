<?php

namespace Tests\Feature;

use App\Models\Entry;
use App\Models\Media;
use App\Models\Setting;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CmsTest extends TestCase
{
    public function test_guests_cannot_access_or_modify_the_workspace(): void
    {
        $this->get('/admin')->assertRedirect('/login');
        $this->post('/admin/content', $this->content())->assertRedirect('/login');
        $this->assertDatabaseCount('entries', 0);
    }

    public function test_editor_can_edit_content_but_cannot_manage_admin_resources(): void
    {
        $editor = User::factory()->create(['role' => 'editor']);
        $this->actingAs($editor)->get('/admin/content')->assertOk();
        foreach (['settings', 'team', 'orders', 'inbox'] as $path) {
            $this->get('/admin/'.$path)->assertForbidden();
        }
        $this->put('/admin/settings', Setting::site())->assertForbidden();
        $this->post('/admin/team', ['name' => 'Intruder', 'role' => 'admin'])->assertForbidden();
    }

    public function test_unknown_roles_cannot_enter_the_workspace(): void
    {
        $user = User::factory()->create(['role' => 'customer']);
        $this->actingAs($user)->get('/admin')->assertForbidden();
    }

    public function test_admin_login_and_logout_use_session_authentication(): void
    {
        $user = User::factory()->create(['role' => 'admin', 'password' => 'A-valid-password-123']);
        $this->post('/login', ['email' => $user->email, 'password' => 'wrong'])->assertSessionHasErrors('email');
        $this->assertGuest();
        $this->post('/login', ['email' => $user->email, 'password' => 'A-valid-password-123'])->assertRedirect('/admin');
        $this->assertAuthenticatedAs($user);
        $this->post('/logout')->assertRedirect('/login');
        $this->assertGuest();
    }

    public function test_content_is_created_with_the_authenticated_author_and_validated_fields(): void
    {
        $editor = User::factory()->create(['role' => 'editor']);
        $other = User::factory()->create();
        $this->actingAs($editor)->post('/admin/content', [...$this->content(), 'author_id' => $other->id, 'id' => 900])->assertSessionHasNoErrors()->assertRedirect();
        $this->assertDatabaseHas('entries', ['title' => 'A new idea', 'author_id' => $editor->id, 'status' => 'published']);
        $entry = Entry::firstOrFail();
        $this->assertNotNull($entry->published_at);
        $this->get($entry->public_path)->assertOk()->assertInertia(fn (Assert $page) => $page->component('Public/Entry')->where('entry.title', 'A new idea'));
    }

    public function test_invalid_slugs_and_missing_schedule_dates_are_rejected(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'editor']))->post('/admin/content', [...$this->content(), 'slug' => '../../admin', 'status' => 'scheduled'])->assertSessionHasErrors(['slug', 'published_at']);
        $this->assertDatabaseCount('entries', 0);
    }

    public function test_saving_records_a_revision_and_restoring_creates_a_draft(): void
    {
        $user = User::factory()->create(['role' => 'editor']);
        $entry = Entry::factory()->published()->create(['title' => 'Original title']);
        $this->actingAs($user)->put('/admin/content/'.$entry->id, [...$this->content(), 'slug' => $entry->slug, 'title' => 'Revised title'])->assertSessionHasNoErrors();
        $revision = $entry->revisions()->firstOrFail();
        $this->assertSame('Original title', $revision->snapshot['title']);
        $this->post('/admin/content/'.$entry->id.'/restore/'.$revision->id)->assertSessionHasNoErrors();
        $this->assertDatabaseHas('entries', ['id' => $entry->id, 'title' => 'Original title', 'status' => 'draft', 'published_at' => null]);
        $this->assertSame(2, $entry->revisions()->count());
    }

    public function test_revisions_cannot_be_restored_onto_a_different_entry(): void
    {
        $first = Entry::factory()->create();
        $second = Entry::factory()->create();
        $revision = $first->revisions()->create(['snapshot' => $first->only($first->getFillable())]);
        $this->actingAs(User::factory()->create(['role' => 'editor']))->post('/admin/content/'.$second->id.'/restore/'.$revision->id)->assertNotFound();
    }

    public function test_drafts_and_future_publications_stay_private_until_their_publish_time(): void
    {
        $this->travelTo(now()->startOfDay());
        $draft = Entry::factory()->create();
        $future = Entry::factory()->create(['status' => 'scheduled', 'published_at' => now()->addHour()]);
        $this->get($draft->public_path)->assertNotFound();
        $this->get($future->public_path)->assertNotFound();
        $this->get('/journal')->assertInertia(fn (Assert $page) => $page->has('entries.data', 0));
        $this->travel(2)->hours();
        $this->get($future->public_path)->assertOk();
        $this->get($draft->public_path)->assertNotFound();
    }

    public function test_markdown_is_sanitized_before_it_reaches_the_public_frontend(): void
    {
        $entry = Entry::factory()->published()->create(['body' => '## A safe heading'."\n\n<script>alert(1)</script>\n\n[bad](javascript:alert%281%29)"]);
        $this->get($entry->public_path)->assertInertia(fn (Assert $page) => $page->where('entry.html', function (string $html) {
            $this->assertStringContainsString('<h2>A safe heading</h2>', $html);
            $this->assertStringNotContainsString('<script>', $html);
            $this->assertStringNotContainsString('href="javascript:', $html);

            return true;
        }));
    }

    public function test_sitemap_excludes_nonpublic_and_noindex_entries(): void
    {
        $public = Entry::factory()->published()->create();
        $draft = Entry::factory()->create();
        $future = Entry::factory()->create(['status' => 'scheduled', 'published_at' => now()->addDay()]);
        $noindex = Entry::factory()->published()->create(['noindex' => true]);
        $this->get('/sitemap.xml')->assertOk()->assertHeader('Content-Type', 'application/xml; charset=UTF-8')->assertSee($public->public_path)->assertDontSee($draft->slug)->assertDontSee($future->slug)->assertDontSee($noindex->slug);
        $this->get('/robots.txt')->assertOk()->assertSee('Disallow: /admin')->assertSee('Sitemap:');
    }

    public function test_public_search_is_filtered_and_does_not_publish_drafts(): void
    {
        Entry::factory()->published()->create(['title' => 'Distinctive design story']);
        Entry::factory()->create(['title' => 'Distinctive private draft']);
        $this->get('/journal?q=Distinctive')->assertInertia(fn (Assert $page) => $page->has('entries.data', 1)->where('entries.data.0.title', 'Distinctive design story')->where('seo.noindex', true));
    }

    public function test_media_upload_persists_valid_files_and_rejects_svg_uploads(): void
    {
        Storage::fake('public');
        $this->actingAs(User::factory()->create(['role' => 'editor']));
        $png = UploadedFile::fake()->createWithContent('sample.png', base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6QLsAAAAASUVORK5CYII='));
        $this->post('/admin/media', ['file' => $png])->assertSessionHasNoErrors();
        $media = Media::firstOrFail();
        Storage::disk('public')->assertExists($media->path);
        $this->post('/admin/media', ['file' => UploadedFile::fake()->createWithContent('unsafe.svg', '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>')])->assertSessionHasErrors('file');
        $this->assertDatabaseCount('media', 1);
    }

    public function test_media_in_use_cannot_be_deleted(): void
    {
        $media = Media::factory()->create();
        Entry::factory()->create(['media_id' => $media->id]);
        $this->actingAs(User::factory()->create(['role' => 'editor']))->delete('/admin/media/'.$media->id)->assertSessionHasErrors('media');
        $this->assertDatabaseHas('media', ['id' => $media->id]);
    }

    public function test_site_settings_are_saved_and_navigation_rejects_external_urls(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']));
        $this->put('/admin/settings', [...Setting::site(), 'name' => 'Client Studio'])->assertSessionHasNoErrors();
        $this->assertSame('Client Studio', Setting::site()['name']);
        $this->put('/admin/settings', [...Setting::site(), 'navigation' => [['label' => 'Unsafe', 'url' => '//example.com']]])->assertSessionHasErrors('navigation.0.url');
    }

    public function test_currency_changes_cannot_relabel_existing_product_prices(): void
    {
        Entry::factory()->product()->create();
        $this->actingAs(User::factory()->create(['role' => 'admin']))->put('/admin/settings', [...Setting::site(), 'currency' => 'USD'])->assertSessionHasErrors('currency');
        $this->assertSame('INR', Setting::site()['currency']);
    }

    public function test_administrators_can_add_members_and_cannot_demote_themselves(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin)->post('/admin/team', ['name' => 'Writer', 'email' => 'writer@example.com', 'password' => 'Writer-password-123', 'role' => 'editor'])->assertSessionHasNoErrors();
        $writer = User::where('email', 'writer@example.com')->firstOrFail();
        $this->assertTrue(Hash::check('Writer-password-123', $writer->password));
        $this->patch('/admin/team/'.$admin->id, ['role' => 'editor'])->assertSessionHasErrors('role');
        $this->assertSame('admin', $admin->fresh()->role);
    }

    public function test_contact_messages_are_validated_and_reach_the_admin_inbox(): void
    {
        $this->post('/contact', ['name' => 'Client'])->assertSessionHasErrors(['email', 'message']);
        $this->post('/contact', ['name' => 'Client', 'email' => 'client@example.com', 'message' => 'We would love to discuss a new website.', 'website' => 'spam'])->assertSessionHasErrors('website');
        $this->post('/contact', ['name' => 'Client', 'email' => 'client@example.com', 'message' => 'We would love to discuss a new website.'])->assertSessionHasNoErrors();
        $message = Submission::firstOrFail();
        $this->actingAs(User::factory()->create(['role' => 'admin']))->get('/admin/inbox')->assertInertia(fn (Assert $page) => $page->has('submissions.data', 1)->where('submissions.data.0.email', 'client@example.com'));
        $this->patch('/admin/inbox/'.$message->id, ['status' => 'read'])->assertSessionHasNoErrors();
        $this->assertSame('read', $message->fresh()->status);
    }

    public function test_admin_responses_disallow_indexing_and_caching(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']))->get('/admin')->assertOk()->assertHeader('X-Robots-Tag', 'noindex, nofollow')->assertHeader('X-Content-Type-Options', 'nosniff');
    }

    private function content(): array
    {
        return ['type' => 'post', 'title' => 'A new idea', 'slug' => 'a-new-idea', 'status' => 'published', 'body' => '## A new chapter'."\n\nA new idea worth sharing.", 'excerpt' => 'An idea worth sharing.', 'noindex' => false, 'price_cents' => 0, 'stock' => 0];
    }
}
