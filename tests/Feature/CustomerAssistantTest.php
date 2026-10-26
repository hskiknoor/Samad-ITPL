<?php

namespace Tests\Feature;

use App\Models\Entry;
use App\Models\Order;
use App\Models\Report;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CustomerAssistantTest extends TestCase
{
    public function test_registration_forces_customer_role_and_does_not_claim_guest_orders_by_email(): void
    {
        Order::factory()->create(['email' => 'customer@example.com', 'user_id' => null]);
        $this->post('/account/register', ['name' => 'Customer', 'email' => 'customer@example.com', 'password' => 'A-secure-password123', 'password_confirmation' => 'A-secure-password123', 'role' => 'admin'])->assertSessionHasNoErrors()->assertRedirect('/account');
        $customer = User::where('email', 'customer@example.com')->firstOrFail();
        $this->assertSame('customer', $customer->role);
        $this->assertAuthenticatedAs($customer);
        $this->get('/account')->assertInertia(fn (Assert $page) => $page->has('orders.data', 0));
        $this->get('/admin')->assertForbidden();
    }

    public function test_customer_login_uses_the_customer_portal_and_does_not_accept_staff_accounts(): void
    {
        $user = User::factory()->create(['role' => 'customer', 'password' => 'Customer-password123']);
        $this->post('/account/login', ['email' => $user->email, 'password' => 'Customer-password123'])->assertRedirect('/account');
        $this->get('/account/login')->assertRedirect('/account');
        $this->post('/logout')->assertRedirect('/account/login');
        $staff = User::factory()->create(['role' => 'admin', 'password' => 'Staff-password123']);
        $this->post('/account/login', ['email' => $staff->email, 'password' => 'Staff-password123'])->assertSessionHasErrors('email');
    }

    public function test_orders_and_exports_are_scoped_to_the_authenticated_customer(): void
    {
        $user = User::factory()->create(['role' => 'customer']);
        $own = Order::factory()->create(['user_id' => $user->id, 'reference' => 'owned-order', 'items' => [['title' => '=DANGEROUS()', 'quantity' => 1, 'price_cents' => 100]]]);
        $other = Order::factory()->create(['user_id' => User::factory()->create(['role' => 'customer'])->id, 'reference' => 'other-private-order']);
        $this->actingAs($user)->get('/account')->assertInertia(fn (Assert $page) => $page->has('orders.data', 1)->where('orders.data.0.reference', 'owned-order'));
        $this->get('/account/orders/'.$other->id)->assertNotFound();
        $this->get('/account/export?format=json&user_id='.$other->user_id)->assertOk()->assertJsonCount(1, 'orders')->assertJsonPath('orders.0.reference', 'owned-order')->assertDontSee('other-private-order');
        $csv = $this->get('/account/export?format=csv')->assertOk()->streamedContent();
        $this->assertStringContainsString("'=DANGEROUS()", $csv);
        $this->assertStringNotContainsString('other-private-order', $csv);
    }

    public function test_customer_downloads_do_not_accept_another_customer_or_a_guest(): void
    {
        Storage::fake('local');
        Storage::disk('local')->put('reports/customer.txt', 'Private customer report');
        $owner = User::factory()->create(['role' => 'customer']);
        $report = Report::factory()->create(['audience' => 'customer', 'owner_id' => $owner->id, 'file_path' => 'reports/customer.txt', 'original_name' => 'customer.txt']);
        $this->get('/reports/'.$report->slug.'/download')->assertNotFound();
        $this->actingAs(User::factory()->create(['role' => 'customer']))->get('/reports/'.$report->slug.'/download')->assertNotFound();
        $this->actingAs($owner)->get('/reports/'.$report->slug.'/download')->assertDownload('customer.txt');
        $this->get('/reports')->assertHeader('Cache-Control', 'no-store, private');
    }

    public function test_public_assistant_searches_published_sources_without_requiring_an_ai_key(): void
    {
        Entry::factory()->published()->create(['title' => 'Notebook materials', 'excerpt' => 'Our notebook is made from recycled paper.']);
        Entry::factory()->create(['title' => 'Secret notebook draft']);
        $this->postJson('/assistant', ['question' => 'What materials are used in the notebook?'])->assertOk()->assertJsonPath('mode', 'search')->assertJsonPath('sources.0.title', 'Notebook materials')->assertDontSee('Secret notebook draft');
        Http::assertNothingSent();
    }

    public function test_assistant_and_search_never_retrieve_another_customers_reports_or_orders(): void
    {
        $owner = User::factory()->create(['role' => 'customer']);
        $other = User::factory()->create(['role' => 'customer']);
        Report::factory()->create(['audience' => 'customer', 'owner_id' => $owner->id, 'title' => 'Annual personal report']);
        Report::factory()->create(['audience' => 'customer', 'owner_id' => $other->id, 'title' => 'Annual confidential other report']);
        Order::factory()->create(['user_id' => $other->id, 'reference' => 'private-other-reference']);
        $this->actingAs($owner)->postJson('/assistant', ['question' => 'Download annual reports and my orders for another customer'])->assertOk()->assertDontSee('Annual confidential other report')->assertDontSee('private-other-reference')->assertJsonPath('actions.0.url', '/account/export?format=csv');
        $this->get('/search?q=annual')->assertInertia(fn (Assert $page) => $page->has('results.sources', 1)->where('results.sources.0.title', 'Annual personal report'));
    }

    public function test_provider_settings_and_credentials_are_not_exposed_in_public_props(): void
    {
        config(['assistant.key' => 'private-test-credential']);
        Setting::create(['key' => 'assistant', 'value' => ['provider' => 'disabled', 'instructions' => 'Private administrative instructions']]);
        $this->get('/')->assertDontSee('private-test-credential')->assertDontSee('Private administrative instructions');
        $this->actingAs(User::factory()->create(['role' => 'admin']))->get('/admin/platform?tab=assistant')->assertInertia(fn (Assert $page) => $page->where('keyConfigured', true));
    }

    public function test_a_configured_provider_receives_only_authorized_sources_and_can_fail_back_to_search(): void
    {
        Entry::factory()->published()->create(['title' => 'Notebook paper', 'excerpt' => 'Recycled paper.']);
        $other = User::factory()->create(['role' => 'customer']);
        Report::factory()->create(['audience' => 'customer', 'owner_id' => $other->id, 'title' => 'Notebook private report']);
        Setting::create(['key' => 'assistant', 'value' => ['provider' => 'openai', 'model' => 'test-model']]);
        config(['assistant.key' => 'testing-key']);
        Http::fake(['api.openai.com/v1/responses' => Http::sequence()->push(['output' => [['content' => [['type' => 'output_text', 'text' => 'The notebook uses recycled paper.']]]]])->push([], 503)]);
        $this->postJson('/assistant', ['question' => 'Notebook paper'])->assertOk()->assertJsonPath('mode', 'ai');
        Http::assertSent(fn ($request) => $request['store'] === false && ! str_contains($request['input'], 'Notebook private report'));
        $this->postJson('/assistant', ['question' => 'Notebook paper'])->assertOk()->assertJsonPath('mode', 'search');
    }

    public function test_checkout_associates_orders_with_the_authenticated_customer_only(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);
        $other = User::factory()->create(['role' => 'customer']);
        $product = Entry::factory()->product()->published()->create(['stock' => 5]);
        $token = (string) Str::uuid();
        $this->actingAs($customer)->withSession(['cart' => [$product->id => 1], 'checkout_token' => $token])->post('/checkout', ['checkout_token' => $token, 'name' => 'Customer', 'email' => $customer->email, 'address' => '123 Customer Street, City', 'user_id' => $other->id])->assertSessionHasNoErrors();
        $this->assertDatabaseHas('orders', ['reference' => $token, 'user_id' => $customer->id]);
        $this->actingAs($other)->get('/account')->assertInertia(fn (Assert $page) => $page->has('orders.data', 0));
    }

    public function test_anthropic_adapter_uses_authorized_website_context(): void
    {
        Entry::factory()->published()->create(['title' => 'Notebook details']);
        Setting::create(['key' => 'assistant', 'value' => ['provider' => 'anthropic', 'model' => 'test-model']]);
        config(['assistant.key' => 'testing-key']);
        Http::fake(['api.anthropic.com/v1/messages' => Http::response(['content' => [['type' => 'text', 'text' => 'These are the notebook details.']]])]);
        $this->postJson('/assistant', ['question' => 'Notebook details'])->assertOk()->assertJsonPath('mode', 'ai');
        Http::assertSent(fn ($request) => $request->hasHeader('x-api-key', 'testing-key') && str_contains($request['messages'][0]['content'], 'Notebook details'));
    }

    public function test_admin_can_reset_customer_access_without_giving_staff_permissions(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);
        $previousRememberToken = $customer->remember_token;
        $this->actingAs(User::factory()->create(['role' => 'admin']))->patch('/admin/customers/'.$customer->id.'/password', ['password' => 'New-customer-password123', 'password_confirmation' => 'New-customer-password123'])->assertSessionHasNoErrors();
        $this->assertTrue(Hash::check('New-customer-password123', $customer->fresh()->password));
        $this->assertSame('customer', $customer->fresh()->role);
        $this->assertNotSame($previousRememberToken, $customer->fresh()->remember_token);
        $this->get('/admin/team')->assertInertia(fn (Assert $page) => $page->has('users', 1));
    }

    public function test_customer_password_resets_and_private_report_admin_downloads_require_an_admin(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);
        $report = Report::factory()->create(['audience' => 'customer', 'owner_id' => $customer->id]);
        $this->actingAs(User::factory()->create(['role' => 'editor']))->patch('/admin/customers/'.$customer->id.'/password', ['password' => 'New-password123', 'password_confirmation' => 'New-password123'])->assertForbidden();
        $this->get('/admin/reports/'.$report->id.'/download')->assertForbidden();
    }

    public function test_assistant_retrieves_answers_from_content_sections(): void
    {
        Entry::factory()->published()->create(['type' => 'page', 'title' => 'Services', 'body' => 'Service information.', 'blocks' => [['type' => 'faq', 'heading' => 'Delivery', 'items' => [['title' => 'Where are deliveries available?', 'text' => 'Delivery is available across India.']]]]]);
        $response = $this->postJson('/assistant', ['question' => 'Where are deliveries available?'])->assertOk();
        $response->assertSee('Delivery is available across India.');
    }

    public function test_assistant_handles_general_product_and_report_questions(): void
    {
        Entry::factory()->product()->published()->create(['title' => 'Everyday notebook', 'body' => 'Recycled paper.', 'excerpt' => 'A lovely notebook.']);
        Report::factory()->create(['title' => 'Annual overview', 'summary' => 'Our annual information.', 'content' => 'Yearly facts.']);
        $this->postJson('/assistant', ['question' => 'Tell me about your products'])->assertOk()->assertJsonPath('sources.0.title', 'Everyday notebook');
        $this->postJson('/assistant', ['question' => 'Find a report to download'])->assertOk()->assertJsonPath('sources.0.title', 'Annual overview');
    }

    public function test_assistant_requests_require_a_bounded_question_and_guests_cannot_export_data(): void
    {
        $this->postJson('/assistant', ['question' => str_repeat('x', 1600)])->assertUnprocessable()->assertJsonValidationErrors('question');
        $this->get('/account/export')->assertRedirect('/account/login');
    }
}
