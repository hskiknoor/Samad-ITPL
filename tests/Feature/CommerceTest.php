<?php

namespace Tests\Feature;

use App\Models\Entry;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CommerceTest extends TestCase
{
    public function test_cart_uses_catalog_prices_and_supports_quantity_changes(): void
    {
        $product = Entry::factory()->product()->published()->create(['price_cents' => 25000, 'stock' => 5]);
        $this->post('/cart/'.$product->id, ['quantity' => 2, 'price_cents' => 1])->assertSessionHasNoErrors();
        $this->get('/cart')->assertInertia(fn (Assert $page) => $page->where('total', 50000)->where('items.0.quantity', 2));
        $this->patch('/cart/'.$product->id, ['quantity' => 3])->assertSessionHasNoErrors();
        $this->get('/cart')->assertInertia(fn (Assert $page) => $page->where('total', 75000));
        $this->delete('/cart/'.$product->id)->assertSessionHas('cart', []);
    }

    public function test_cart_rejects_excess_stock_and_private_or_nonproduct_content(): void
    {
        $product = Entry::factory()->product()->published()->create(['stock' => 2]);
        $draft = Entry::factory()->product()->create();
        $post = Entry::factory()->published()->create();
        $this->post('/cart/'.$product->id, ['quantity' => 3])->assertSessionHasErrors('quantity');
        $this->post('/cart/'.$draft->id, ['quantity' => 1])->assertNotFound();
        $this->post('/cart/'.$post->id, ['quantity' => 1])->assertNotFound();
    }

    public function test_checkout_reserves_stock_and_saves_trusted_totals_once(): void
    {
        $product = Entry::factory()->product()->published()->create(['price_cents' => 60000, 'stock' => 5]);
        $token = (string) Str::uuid();
        $payload = [...$this->customer(), 'checkout_token' => $token, 'total_cents' => 1];
        $this->withSession(['cart' => [$product->id => 2], 'checkout_token' => $token])->post('/checkout', $payload)->assertSessionHasNoErrors()->assertRedirect('/order/'.$token);
        $this->assertDatabaseHas('orders', ['reference' => $token, 'total_cents' => 120000, 'status' => 'new', 'currency' => 'INR']);
        $this->assertSame(3, $product->fresh()->stock);
        $this->get('/order/'.$token)->assertOk()->assertHeader('X-Robots-Tag', 'noindex, nofollow');
        $this->post('/checkout', $payload)->assertSessionHasErrors('checkout');
        $this->assertDatabaseCount('orders', 1);
        $this->assertSame(3, $product->fresh()->stock);
    }

    public function test_checkout_rolls_back_every_stock_change_if_any_item_is_unavailable(): void
    {
        $available = Entry::factory()->product()->published()->create(['stock' => 5]);
        $unavailable = Entry::factory()->product()->published()->create(['stock' => 0]);
        $token = (string) Str::uuid();
        $this->withSession(['cart' => [$available->id => 2, $unavailable->id => 1], 'checkout_token' => $token])->post('/checkout', [...$this->customer(), 'checkout_token' => $token])->assertSessionHasErrors('checkout');
        $this->assertDatabaseCount('orders', 0);
        $this->assertSame(5, $available->fresh()->stock);
    }

    public function test_receipts_are_private_to_the_checkout_session(): void
    {
        $order = Order::factory()->create();
        $this->get('/order/'.$order->reference)->assertNotFound();
    }

    public function test_cancelling_an_order_restores_stock_exactly_once(): void
    {
        $product = Entry::factory()->product()->create(['stock' => 3]);
        $order = Order::factory()->create(['items' => [['entry_id' => $product->id, 'title' => $product->title, 'quantity' => 2, 'price_cents' => $product->price_cents]]]);
        $this->actingAs(User::factory()->create(['role' => 'admin']))->patch('/admin/orders/'.$order->id, ['status' => 'cancelled'])->assertSessionHasNoErrors();
        $this->assertSame(5, $product->fresh()->stock);
        $this->patch('/admin/orders/'.$order->id, ['status' => 'cancelled'])->assertSessionHasErrors('status');
        $this->assertSame(5, $product->fresh()->stock);
    }

    public function test_editors_cannot_change_orders_or_view_customer_data(): void
    {
        $order = Order::factory()->create();
        $this->actingAs(User::factory()->create(['role' => 'editor']))->patch('/admin/orders/'.$order->id, ['status' => 'completed'])->assertForbidden();
        $this->get('/admin/orders')->assertForbidden();
        $this->assertSame('new', $order->fresh()->status);
    }

    private function customer(): array
    {
        return ['name' => 'A Customer', 'email' => 'customer@example.com', 'address' => '12 Example Street, New Delhi, India'];
    }
}
